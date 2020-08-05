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

export const QUICK_FIX_STABLE_ID_COMMAND = "ui5_lang.quick_fix_stable_id";
const QUICK_FIX_STABLE_ID_COMMAND_TITLE = "Generate ID";

export function diagnosticToCodeActionFix(
  document: TextDocument,
  diagnostic: Diagnostic
): CodeAction | undefined {
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
      });
    }
    default:
      return undefined;
  }
}

function computeCodeActionForQuickFixStableId(opts: {
  document: TextDocument;
  xmlDocument: XMLDocument;
  nonStableIdDiagnostic: Diagnostic;
}): CodeAction | undefined {
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
  return CodeAction.create(
    QUICK_FIX_STABLE_ID_COMMAND_TITLE,
    Command.create(
      QUICK_FIX_STABLE_ID_COMMAND_TITLE,
      QUICK_FIX_STABLE_ID_COMMAND,
      opts.document.uri,
      replaceRange,
      quickFixStableIdInfo.newText
    ),
    CodeActionKind.QuickFix
  );
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
