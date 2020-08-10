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
import { computeQuickFixStableIdInfo } from "@ui5-language-assistant/xml-views-quick-fix";
import { parse, DocumentCstNode } from "@xml-tools/parser";
import { buildAst, XMLDocument } from "@xml-tools/ast";
import { LSPRangeToOffsetRange, offsetRangeToLSPRange } from "./range-utils";
import {
  validateXMLView,
  validateNonStableId,
  UI5XMLViewIssue,
} from "@ui5-language-assistant/xml-views-validation";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { UI5Validators } from "@ui5-language-assistant/xml-views-validation/src/validate-xml-views";
import { map, concat, compact, forEach } from "lodash";
import { OffsetRange } from "@ui5-language-assistant/logic-utils";
import { QuickFixStableIdInfo } from "@ui5-language-assistant/xml-views-quick-fix/src/quick-fix-stable-id";

export const QUICK_FIX_STABLE_ID_COMMAND = "ui5_lang.quick_fix_stable_id";
export const QUICK_FIX_FILE_STABLE_ID_COMMAND =
  "ui5_lang.quick_fix_file_stable_id";
const QUICK_FIX_STABLE_ID_COMMAND_TITLE = "Generate ID";
const QUICK_FIX_FILE_STABLE_ID_COMMAND_TITLE = "Generate IDs for all file";

export function diagnosticToCodeActionFix(
  document: TextDocument,
  diagnostic: Diagnostic,
  ui5Model: UI5SemanticModel
): CodeAction[] | undefined {
  const documentText = document.getText();
  // We prefer to parse the document again to avoid cache state handling
  const { cst, tokenVector } = parse(documentText);
  const xmlDocAst = buildAst(cst as DocumentCstNode, tokenVector);
  switch (diagnostic.code) {
    case 1000: {
      // non stable id
      return computeCodeActionForQuickFixStableId({
        document,
        xmlDocument: xmlDocAst,
        nonStableIdDiagnostic: diagnostic,
        ui5Model,
      });
    }
    default:
      return [];
  }
}

function computeCodeActionForQuickFixStableId(opts: {
  document: TextDocument;
  xmlDocument: XMLDocument;
  nonStableIdDiagnostic: Diagnostic;
  ui5Model: UI5SemanticModel;
}): CodeAction[] | undefined {
  const codeActions = [];
  const errorOffset = LSPRangeToOffsetRange(
    opts.nonStableIdDiagnostic.range,
    opts.document
  );

  const quickFixStableIdInfo = computeQuickFixStableIdInfo(
    opts.xmlDocument,
    errorOffset
  );

  if (quickFixStableIdInfo === undefined) {
    return undefined;
  }

  const replaceRange = offsetRangeToLSPRange(
    quickFixStableIdInfo.replaceRange,
    opts.document
  );

  const validators = {
    document: [],
    element: [validateNonStableId],
    attribute: [],
  };
  const nonStableIdFileIssues = validateXMLView({
    validators,
    model: opts.ui5Model,
    xmlView: opts.xmlDocument,
  });
  codeActions.push(
    CodeAction.create(
      QUICK_FIX_STABLE_ID_COMMAND_TITLE,
      Command.create(
        QUICK_FIX_STABLE_ID_COMMAND_TITLE,
        QUICK_FIX_STABLE_ID_COMMAND,
        opts.document.uri,
        replaceRange,
        quickFixStableIdInfo.newText
      ),
      CodeActionKind.QuickFix
    )
  );

  // codeActions.push(CodeAction.create(
  //   QUICK_FIX_FILE_STABLE_ID_COMMAND_TITLE,
  //   Command.create(
  //     QUICK_FIX_FILE_STABLE_ID_COMMAND_TITLE,
  //     QUICK_FIX_FILE_STABLE_ID_COMMAND,
  //     opts.document.uri,
  //     compact(map(nonStableIdFileIssues, _ => computeQuickFixStableIdInfo(opts.xmlDocument, _.offsetRange)))
  //   ),
  //   CodeActionKind.QuickFix
  // ));

  return codeActions;
}

export function executeQuickFixStableIdCommand(opts: {
  textDocument: TextDocument;
  quickFixReplaceRange: LSPRange;
  quickFixNewText: string;
}): TextDocumentEdit[] {
  const documentEdit = [
    TextDocumentEdit.create(
      { uri: opts.textDocument.uri, version: opts.textDocument.version },
      [TextEdit.replace(opts.quickFixReplaceRange, `${opts.quickFixNewText}`)]
    ),
  ];

  return documentEdit;
}

export function executeQuickFixFIleStableIdCommand(
  textDocument: TextDocument,
  nonStableIdIssues: QuickFixStableIdInfo[]
): TextDocumentEdit[] {
  const textEdits: TextEdit[] = [];
  forEach(nonStableIdIssues, (_) => {
    textEdits.push(
      TextEdit.replace(
        offsetRangeToLSPRange(_.replaceRange, textDocument),
        `${_.newText}`
      )
    );
  });

  const documentEdit = [
    TextDocumentEdit.create(
      { uri: textDocument.uri, version: textDocument.version },
      textEdits
    ),
  ];

  return documentEdit;
}
