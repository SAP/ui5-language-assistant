import { ExecuteCommandParams } from "vscode-languageserver";
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
import { getQuickFixIdInfo } from "@ui5-language-assistant/xml-views-quick-fix";
import { parse, DocumentCstNode } from "@xml-tools/parser";
import { buildAst, XMLDocument } from "@xml-tools/ast";
import { LSPRangeToOffsetRange, offsetRangeToLSPRange } from "./range-utils";

export function getQuickFixCodeAction(
  document: TextDocument,
  diagnostic: Diagnostic
): CodeAction | undefined {
  const documentText = document.getText();
  // We prefer to parse the document again to avoid cache state handling
  const { cst, tokenVector } = parse(documentText);
  const xmlDocAst = buildAst(cst as DocumentCstNode, tokenVector);
  switch (diagnostic.code) {
    case 666: {
      // non stable id
      return getCodeActionForQuickFixId({
        document,
        xmlDocument: xmlDocAst,
        nonStableIdDiagnostic: diagnostic,
      });
    }
    default:
      return undefined;
  }
}

export function executeCommand(
  textDocument: TextDocument,
  params: ExecuteCommandParams
): TextDocumentEdit[] | undefined {
  switch (params.command) {
    case "nonStableIdQuickFix": {
      return executeQuickFixIdCommand({
        textDocument,
        // @ts-expect-error - we already checked arguments exist
        quickFixRange: params.arguments[1],
        // @ts-expect-error - we already checked arguments exist
        quickFixIDSuggestion: params.arguments[2],
      });
    }
    default:
      return undefined;
  }
}

function getCodeActionForQuickFixId(opts: {
  document: TextDocument;
  xmlDocument: XMLDocument;
  nonStableIdDiagnostic: Diagnostic;
}): CodeAction | undefined {
  const errorOffset = LSPRangeToOffsetRange(
    opts.nonStableIdDiagnostic.range,
    opts.document
  );

  const quickFixIdInfo = getQuickFixIdInfo(opts.xmlDocument, errorOffset);
  if (quickFixIdInfo === undefined) {
    return undefined;
  }

  const title = "Generate ID";
  return CodeAction.create(
    title,
    Command.create(
      title,
      "nonStableIdQuickFix",
      opts.document.uri,
      offsetRangeToLSPRange(
        quickFixIdInfo.quickFixIdOffsetRange,
        opts.document
      ),
      quickFixIdInfo.quickFixIdSuggesion
    ),
    CodeActionKind.QuickFix
  );
}

function executeQuickFixIdCommand(opts: {
  textDocument: TextDocument;
  quickFixRange: LSPRange;
  quickFixIDSuggestion: string;
}) {
  const documentEdit = [
    TextDocumentEdit.create(
      { uri: opts.textDocument.uri, version: opts.textDocument.version },
      [TextEdit.replace(opts.quickFixRange, `${opts.quickFixIDSuggestion}`)]
    ),
  ];

  return documentEdit;
}
