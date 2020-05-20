import {
  TextDocumentPositionParams,
  TextDocument,
  Hover,
} from "vscode-languageserver";
import { parse, DocumentCstNode } from "@xml-tools/parser";
import { buildAst, XMLAttribute, XMLElement, DEFAULT_NS } from "@xml-tools/ast";
import { isXMLNamespaceKey } from "@xml-tools/common";
import {
  XMLElementOpenName,
  XMLElementCloseName,
  XMLAttributeKey,
  XMLAttributeValue,
  getAstNodeInPosition,
} from "@xml-tools/ast-position";
import { find } from "lodash";
import {
  xmlToFQN,
  ui5NodeToFQN,
  flattenAggregations,
  getUI5ClassByXMLElement,
  getUI5PropertyByXMLAttributeKey,
} from "@ui5-language-assistant/logic-utils";
import {
  UI5Class,
  UI5Aggregation,
  UI5SemanticModel,
  UI5Namespace,
  UI5EnumValue,
  UI5Enum,
  BaseUI5Node,
} from "@ui5-language-assistant/semantic-model-types";
import { getNodeDocumentation } from "./documentation";
import { findSymbol } from "@ui5-language-assistant/semantic-model";
import { findUI5HoverNodeAtOffset } from "@ui5-language-assistant/xml-views-tooltip";

export function getHoverResponse(
  model: UI5SemanticModel,
  textDocumentPosition: TextDocumentPositionParams,
  document: TextDocument
): Hover | undefined {
  const documentText = document.getText();
  const { cst, tokenVector } = parse(documentText);
  const ast = buildAst(cst as DocumentCstNode, tokenVector);
  const offset = document.offsetAt(textDocumentPosition.position);
  const visitor = getAstNodeInPosition(ast, offset);
  const ui5Node = findUI5HoverNodeAtOffset(visitor, model);
  if (ui5Node != undefined) {
    return transformToLspHover(ui5Node, model);
  }

  return undefined;
}

function transformToLspHover(
  ui5Node: BaseUI5Node,
  model: UI5SemanticModel
): Hover | undefined {
  const hoverItem: Hover = {
    contents: getNodeDocumentation(ui5Node, model),
  };
  return hoverItem;
}
