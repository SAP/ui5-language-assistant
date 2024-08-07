import {
  TextDocumentPositionParams,
  TextDocument,
  Hover,
  MarkupContent,
  MarkupKind,
} from "vscode-languageserver";
import { astPositionAtOffset } from "@xml-tools/ast-position";
import {
  UI5SemanticModel,
  BaseUI5Node,
} from "@ui5-language-assistant/semantic-model-types";
import { findUI5HoverNodeAtOffset } from "@ui5-language-assistant/xml-views-tooltip";
import { getNodeDocumentation, getNodeDetail } from "./documentation";
import { track } from "./swa";
import type { Context } from "@ui5-language-assistant/context";
import { getHover } from "@ui5-language-assistant/binding";

export function getHoverResponse(
  context: Context,
  textDocumentPosition: TextDocumentPositionParams,
  document: TextDocument
): Hover | undefined {
  const ast = context.viewFiles[context.documentPath];
  const offset = document.offsetAt(textDocumentPosition.position);
  const astPosition = astPositionAtOffset(ast, offset);
  if (astPosition !== undefined) {
    const ui5Node = findUI5HoverNodeAtOffset(astPosition, context);
    if (ui5Node !== undefined) {
      track("XML_UI5_DOC_HOVER", ui5Node.kind);
      return transformToLspHover(ui5Node, context.ui5Model);
    }
    if (astPosition.kind === "XMLAttributeValue") {
      return getHover(
        { ...context, textDocumentPosition },
        astPosition.astNode
      );
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
  const markupWithTitle = `\`${title.split("\n\n").join("`\n\n`")}\`\n\n---\n${
    documentation.value
  }`;
  return { kind: MarkupKind.Markdown, value: markupWithTitle };
}
