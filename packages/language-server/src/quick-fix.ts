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
import {
  validateXMLView,
  validators,
} from "@ui5-language-assistant/xml-views-validation";
import { computeQuickFixStableIdInfo } from "@ui5-language-assistant/xml-views-quick-fix";
import {
  validations,
  commands,
} from "@ui5-language-assistant/user-facing-text";
import { LSPRangeToOffsetRange, offsetRangeToLSPRange } from "./range-utils";
import { Context } from "@ui5-language-assistant/context";

export type QuickFixStableIdLSPInfo = {
  newText: string;
  replaceRange: Range;
};

export function diagnosticToCodeActionFix(
  document: TextDocument,
  diagnostics: Diagnostic[],
  context: Context
): CodeAction[] {
  const codeActions = flatMap(diagnostics, (diagnostic) => {
    switch (diagnostic.code) {
      case validations.NON_STABLE_ID.code: {
        // non stable id
        return computeCodeActionsForQuickFixStableId({
          document,
          nonStableIdDiagnostic: diagnostic,
          context,
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
  nonStableIdDiagnostic: Diagnostic;
  context: Context;
}): CodeAction[] {
  let codeActions: CodeAction[] = [];
  const errorOffset = LSPRangeToOffsetRange(
    opts.nonStableIdDiagnostic.range,
    opts.document
  );

  const quickFixStableIdInfo = computeQuickFixStableIdInfo(opts.context, [
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

  const quickFixFileStableIdCodeActions =
    computeCodeActionsForQuickFixFileStableId({
      document: opts.document,
      context: opts.context,
    });

  codeActions = codeActions.concat(quickFixFileStableIdCodeActions);

  return codeActions;
}

function computeCodeActionsForQuickFixFileStableId(opts: {
  document: TextDocument;
  context: Context;
}): CodeAction[] {
  const actualValidators = {
    document: [],
    element: [validators.validateNonStableId],
    attribute: [],
  };

  // We re-validate intentionally to keep the flow simple & stateless
  const nonStableIdFileIssues = validateXMLView({
    validators: actualValidators,
    context: opts.context,
    xmlView: opts.context.viewFiles[opts.context.documentPath],
  });

  // We don't suggest quick fix stable stable id for entire file when there is only one non-stable id issue
  if (nonStableIdFileIssues.length === 1) {
    return [];
  }

  const errorsOffset = map(nonStableIdFileIssues, (_) => _.offsetRange);
  const nonStableIdFileIssuesInfo = computeQuickFixStableIdInfo(
    opts.context,
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
