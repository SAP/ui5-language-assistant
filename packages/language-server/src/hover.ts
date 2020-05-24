import {
  TextDocumentPositionParams,
  TextDocument,
  Hover,
  MarkupContent,
  MarkupKind,
} from "vscode-languageserver";
import { parse, DocumentCstNode } from "@xml-tools/parser";
import { buildAst } from "@xml-tools/ast";
import { getAstNodeInPosition } from "@xml-tools/ast-position";
import {
  UI5SemanticModel,
  BaseUI5Node,
} from "@ui5-language-assistant/semantic-model-types";
import { findUI5HoverNodeAtOffset } from "@ui5-language-assistant/xml-views-tooltip";
import { getNodeDocumentation, getNodeDetail } from "./documentation";

export function getHoverResponse(
  model: UI5SemanticModel,
  textDocumentPosition: TextDocumentPositionParams,
  document: TextDocument
): Hover | undefined {
  const documentText = document.getText();
  const { cst, tokenVector } = parse(documentText);
  const ast = buildAst(cst as DocumentCstNode, tokenVector);
  const offset = document.offsetAt(textDocumentPosition.position);
  const astPosition = getAstNodeInPosition(ast, offset);
  if (astPosition !== undefined) {
    const ui5Node = findUI5HoverNodeAtOffset(astPosition, model);
    if (ui5Node !== undefined) {
      return transformToLspHover(ui5Node, model);
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
