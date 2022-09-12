import {
  UI5SemanticModel,
  BaseUI5Node,
  UI5Prop,
  UI5Field,
  UI5Aggregation,
  UI5Association,
} from "@ui5-language-assistant/semantic-model-types";
import { MarkupContent } from "vscode-languageserver";
import {
  getRootSymbolParent,
  ui5NodeToFQN,
  isRootSymbol,
  typeToString,
  getDeprecationMessage,
  convertJSDocToMarkdown,
  getLink,
} from "@ui5-language-assistant/logic-utils";
import { GENERATED_LIBRARY } from "@ui5-language-assistant/semantic-model";
import { DocumentCstNode, parse } from "@xml-tools/parser";
import { buildAst } from "@xml-tools/ast";
import { astPositionAtOffset } from "@xml-tools/ast-position";
import { findUI5HoverNodeAtOffset } from "@ui5-language-assistant/xml-views-tooltip";
import { getSemanticModel } from "./ui5-model";

export function getNodeDocumentation(
  node: BaseUI5Node,
  model: UI5SemanticModel
): MarkupContent {
  // Note: most of this code was taken from ui5-typescript repository and adapted for better markdown support.
  // This should be consolidated in the future.
  let contents = "";
  const NL = "\n";
  const EMPTY_STRING = "";

  contents += node.since
    ? `Available since version ${node.since}.` + NL
    : EMPTY_STRING;

  if (node.deprecatedInfo?.isDeprecated) {
    // Since and Deprecated are both present
    if (contents !== "") {
      contents += NL;
    }
    contents += getDeprecationMessage({
      since: node.deprecatedInfo.since,
      text: node.deprecatedInfo.text,
    });
    contents += NL;
  }

  if (node.experimentalInfo?.isExperimental) {
    if (contents !== "") {
      contents += NL;
    }
    contents += "Experimental";
    contents += node.experimentalInfo.since
      ? ` since version ${node.experimentalInfo.since}`
      : EMPTY_STRING;
    contents += ".";
    contents += node.experimentalInfo.text
      ? ` ${node.experimentalInfo.text}`
      : EMPTY_STRING;
    contents += NL;
  }
  // Clearly separate annotations and regular doc block
  if (contents.length > 0) {
    contents += NL;
  }

  contents += node.description ? node.description + NL : EMPTY_STRING;

  const markdownContent: MarkupContent = {
    kind: "markdown",
    value: convertJSDocToMarkdown(contents, model),
  };

  const symbolForDocumentation = getRootSymbolParent(node);
  if (
    symbolForDocumentation !== undefined &&
    symbolForDocumentation.library !== GENERATED_LIBRARY
  ) {
    const link = getLink(model, ui5NodeToFQN(symbolForDocumentation));
    markdownContent.value += NL + `[More information](${link})` + NL;
  }

  return markdownContent;
}

export function getNodeDetail(node: BaseUI5Node): string {
  // Types with fully qualified name
  if (isRootSymbol(node)) {
    return ui5NodeToFQN(node);
  }
  switch (node.kind) {
    case "UI5Prop":
      return `(property) ${node.name}: ${typeToString((node as UI5Prop).type)}`;
    /* istanbul ignore next */
    case "UI5Field":
      return `(field) ${node.name}: ${typeToString((node as UI5Field).type)}`;
    case "UI5Aggregation":
      return `(aggregation) ${node.name}: ${typeToString(
        (node as UI5Aggregation).type
      )}`;
    case "UI5Association":
      return `(association) ${node.name}: ${typeToString(
        (node as UI5Association).type
      )}`;
    case "UI5Event":
      return `(event) ${node.name}`;
    case "UI5EnumValue":
    default:
      return node.name;
  }
}

export async function getUI5NodeName(
  offsetAt: number,
  text: string,
  model?: UI5SemanticModel,
  cachePath?: string,
  framework?: string,
  ui5Version?: string
): Promise<BaseUI5Node | undefined> {
  const documentText = text;
  const { cst, tokenVector } = parse(documentText);
  const ast = buildAst(cst as DocumentCstNode, tokenVector);
  const offset = offsetAt;
  const astPosition = astPositionAtOffset(ast, offset);
  if (!model) {
    model = await fetchModel(cachePath, framework, ui5Version);
  }
  if (astPosition !== undefined) {
    return findUI5HoverNodeAtOffset(astPosition, model);
  }
  return undefined;
}

async function fetchModel(cachePath, framework, ui5Version) {
  const ui5Model = await getSemanticModel(cachePath, framework, ui5Version);
  return ui5Model;
}
