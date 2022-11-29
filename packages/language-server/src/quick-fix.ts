import { map, flatMap } from "lodash";
import { Range } from "vscode-languageserver-textdocument";
import {
  Diagnostic,
  Range as LSPRange,
  TextDocument,
  CodeAction,
  Command,
  CodeActionKind,
  TextDocumentEdit,
  TextEdit,
} from "vscode-languageserver-types";
import { parse, DocumentCstNode } from "@xml-tools/parser";
import { buildAst, XMLDocument } from "@xml-tools/ast";
import {
  validateXMLView,
  validators,
} from "@ui5-language-assistant/xml-views-validation";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { computeQuickFixStableIdInfo } from "@ui5-language-assistant/xml-views-quick-fix";
import { computeQuickFixHardcodedI18nStringInfo } from "@ui5-language-assistant/xml-views-quick-fix";
import {
  validations,
  commands,
} from "@ui5-language-assistant/user-facing-text";
import { LSPRangeToOffsetRange, offsetRangeToLSPRange } from "./range-utils";
import { Property } from "properties-file";

type QuickFixStableIdLSPInfo = {
  newText: string;
  replaceRange: Range;
};

export function diagnosticToCodeActionFix(
  document: TextDocument,
  diagnostics: Diagnostic[],
  ui5Model: UI5SemanticModel,
  resourceBundle: Property[]
): CodeAction[] {
  const documentText = document.getText();
  // We prefer to parse the document again to avoid cache state handling
  const { cst, tokenVector } = parse(documentText);
  const xmlDocAst = buildAst(cst as DocumentCstNode, tokenVector);
  const codeActions = flatMap(diagnostics, (diagnostic) => {
    switch (diagnostic.code) {
      case validations.NON_STABLE_ID.code: {
        // non stable id
        return computeCodeActionsForQuickFixStableId({
          document,
          xmlDocument: xmlDocAst,
          nonStableIdDiagnostic: diagnostic,
          ui5Model,
        });
      }
      case validations.HARDCODED_I18N_STRING.code: {
        // hardcoded i18n string
        return computeCodeActionsForQuickFixHardcodedI18nString({
          document,
          xmlDocument: xmlDocAst,
          hardcodedI18nStringDiagnostic: diagnostic,
          ui5Model,
          resourceBundle,
        });
      }
      default:
        return [];
    }
  });

  return codeActions;
}

function computeCodeActionsForQuickFixStableId(opts: {
  document: TextDocument;
  xmlDocument: XMLDocument;
  nonStableIdDiagnostic: Diagnostic;
  ui5Model: UI5SemanticModel;
}): CodeAction[] {
  let codeActions: CodeAction[] = [];
  const errorOffset = LSPRangeToOffsetRange(
    opts.nonStableIdDiagnostic.range,
    opts.document
  );

  const quickFixStableIdInfo = computeQuickFixStableIdInfo(opts.xmlDocument, [
    errorOffset,
  ]);

  const replaceRange = offsetRangeToLSPRange(
    quickFixStableIdInfo[0].replaceRange,
    opts.document
  );

  codeActions.push(
    CodeAction.create(
      commands.QUICK_FIX_STABLE_ID_ERROR.title,
      Command.create(
        commands.QUICK_FIX_STABLE_ID_ERROR.title,
        commands.QUICK_FIX_STABLE_ID_ERROR.name,
        opts.document.uri,
        opts.document.version,
        replaceRange,
        quickFixStableIdInfo[0].newText
      ),
      CodeActionKind.QuickFix
    )
  );

  const quickFixFileStableIdCodeActions = computeCodeActionsForQuickFixFileStableId(
    {
      document: opts.document,
      xmlDocument: opts.xmlDocument,
      ui5Model: opts.ui5Model,
    }
  );

  codeActions = codeActions.concat(quickFixFileStableIdCodeActions);

  return codeActions;
}

function computeCodeActionsForQuickFixFileStableId(opts: {
  document: TextDocument;
  xmlDocument: XMLDocument;
  ui5Model: UI5SemanticModel;
}): CodeAction[] {
  const actualValidators = {
    document: [],
    element: [validators.validateNonStableId],
    attribute: [],
  };

  // We re-validate intentionally to keep the flow simple & stateless
  const nonStableIdFileIssues = validateXMLView({
    validators: actualValidators,
    model: opts.ui5Model,
    xmlView: opts.xmlDocument,
  });

  // We don't suggest quick fix stabel stable id for entire file when there is only one non-stable id issue
  if (nonStableIdFileIssues.length === 1) {
    return [];
  }

  const errorsOffset = map(nonStableIdFileIssues, (_) => _.offsetRange);
  const nonStableIdFileIssuesInfo = computeQuickFixStableIdInfo(
    opts.xmlDocument,
    errorsOffset
  );
  const nonStableIdFileIssuesLSPInfo: QuickFixStableIdLSPInfo[] = map(
    nonStableIdFileIssuesInfo,
    (_) => ({
      newText: _.newText,
      replaceRange: offsetRangeToLSPRange(_.replaceRange, opts.document),
    })
  );

  return [
    CodeAction.create(
      commands.QUICK_FIX_STABLE_ID_FILE_ERRORS.title,
      Command.create(
        commands.QUICK_FIX_STABLE_ID_FILE_ERRORS.title,
        commands.QUICK_FIX_STABLE_ID_FILE_ERRORS.name,
        opts.document,
        opts.document.uri,
        opts.document.version,
        nonStableIdFileIssuesLSPInfo
      ),
      CodeActionKind.QuickFix
    ),
  ];
}

export function executeQuickFixStableIdCommand(opts: {
  documentUri: string;
  documentVersion: number;
  quickFixReplaceRange: LSPRange;
  quickFixNewText: string;
}): TextDocumentEdit[] {
  const documentEdit = [
    TextDocumentEdit.create(
      { uri: opts.documentUri, version: opts.documentVersion },
      [TextEdit.replace(opts.quickFixReplaceRange, `${opts.quickFixNewText}`)]
    ),
  ];

  return documentEdit;
}

export function executeQuickFixFileStableIdCommand(opts: {
  documentUri: string;
  documentVersion: number;
  nonStableIdIssues: QuickFixStableIdLSPInfo[];
}): TextDocumentEdit[] {
  const textEdits = map(opts.nonStableIdIssues, (_) =>
    TextEdit.replace(_.replaceRange, `${_.newText}`)
  );
  const documentEdit = [
    TextDocumentEdit.create(
      { uri: opts.documentUri, version: opts.documentVersion },
      textEdits
    ),
  ];

  return documentEdit;
}

function computeCodeActionsForQuickFixHardcodedI18nString(opts: {
  document: TextDocument;
  xmlDocument: XMLDocument;
  hardcodedI18nStringDiagnostic: Diagnostic;
  ui5Model: UI5SemanticModel;
  resourceBundle: Property[];
}): CodeAction[] {
  const codeActions: CodeAction[] = [];

  const errorOffset = LSPRangeToOffsetRange(
    opts.hardcodedI18nStringDiagnostic.range,
    opts.document
  );

  const quickFixHardcodedI18nStringInfo = computeQuickFixHardcodedI18nStringInfo(
    opts.xmlDocument,
    [errorOffset],
    opts.resourceBundle
  );

  const replaceRange = offsetRangeToLSPRange(
    quickFixHardcodedI18nStringInfo[0].replaceRange,
    opts.document
  );

  quickFixHardcodedI18nStringInfo[0].newTextSuggestions.forEach(
    (suggestion) => {
      const codeActionTitle =
        commands.QUICK_FIX_HARDCODED_I18N_STRING_ERROR.title +
        ": " +
        suggestion.suggestionValue +
        " (" +
        suggestion.suggestionKey +
        ")";
      codeActions.push(
        CodeAction.create(
          codeActionTitle,
          Command.create(
            commands.QUICK_FIX_HARDCODED_I18N_STRING_ERROR.title,
            commands.QUICK_FIX_HARDCODED_I18N_STRING_ERROR.name,
            opts.document.uri,
            opts.document.version,
            replaceRange,
            suggestion.newText
          ),
          CodeActionKind.QuickFix
        )
      );
    }
  );

  return codeActions;
}

export function executeQuickFixHardcodedI18nStringCommand(opts: {
  documentUri: string;
  documentVersion: number;
  quickFixReplaceRange: LSPRange;
  quickFixNewText: string;
}): TextDocumentEdit[] {
  const documentEdit = [
    TextDocumentEdit.create(
      { uri: opts.documentUri, version: opts.documentVersion },
      [TextEdit.replace(opts.quickFixReplaceRange, `${opts.quickFixNewText}`)]
    ),
  ];

  return documentEdit;
}
