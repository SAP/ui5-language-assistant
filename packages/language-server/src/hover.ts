import {
  TextDocumentPositionParams,
  TextDocument,
  Hover,
  MarkupContent,
  MarkupKind,
} from "vscode-languageserver";
import { parse, DocumentCstNode } from "@xml-tools/parser";
import { buildAst } from "@xml-tools/ast";
import { astPositionAtOffset } from "@xml-tools/ast-position";
import {
  UI5SemanticModel,
  BaseUI5Node,
} from "@ui5-language-assistant/semantic-model-types";
import { findUI5HoverNodeAtOffset } from "@ui5-language-assistant/xml-views-tooltip";
import { getNodeDocumentation, getNodeDetail } from "./documentation";
import { track } from "./swa";
import type { Context } from "@ui5-language-assistant/context";

export function getHoverResponse(
  context: Context,
  textDocumentPosition: TextDocumentPositionParams,
  document: TextDocument
): Hover | undefined {
  const documentText = document.getText();
  const { cst, tokenVector } = parse(documentText);
  const ast = buildAst(cst as DocumentCstNode, tokenVector);
  const offset = document.offsetAt(textDocumentPosition.position);
  const astPosition = astPositionAtOffset(ast, offset);
  if (astPosition !== undefined) {
    const ui5Node = findUI5HoverNodeAtOffset(astPosition, context);
    if (ui5Node !== undefined) {
      track("XML_UI5_DOC_HOVER", ui5Node.kind);
      return transformToLspHover(ui5Node, context.ui5Model);
    }
  }

  return undefined;
}

function transformToLspHover(
  ui5Node: BaseUI5Node,
  model: UI5SemanticModel
): Hover | undefined {
  const hoverItem: Hover = {
    contents: addTitle(
      getNodeDetail(ui5Node),
      getNodeDocumentation(ui5Node, model)
    ),
  };
  return hoverItem;
}

function addTitle(title: string, documentation: MarkupContent): MarkupContent {
  const markupWithTitle = `\`${title}\`\n\n---\n${documentation.value}`;
  return { kind: MarkupKind.Markdown, value: markupWithTitle };
}
