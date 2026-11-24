import {
  TextDocumentPositionParams,
  TextDocument,
  Hover,
  MarkupContent,
  MarkupKind,
  Range,
} from "vscode-languageserver";
import {
  astPositionAtOffset,
  XMLElementOpenName,
  XMLElementCloseName,
  XMLAttributeKey,
  XMLAttributeValue,
} from "@xml-tools/ast-position";
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
      return transformToLspHover(
        ui5Node,
        context.ui5Model,
        getHoverRange(astPosition, document)
      );
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

/**
 * The range of the XML token the hover applies to (e.g. the whole qualified
 * tag name including its prefix), so the client highlights all of it instead
 * of only the word under the cursor.
 */
function getHoverRange(
  astPosition:
    | XMLElementOpenName
    | XMLElementCloseName
    | XMLAttributeKey
    | XMLAttributeValue,
  document: TextDocument
): Range | undefined {
  let token: { startOffset: number; endOffset: number } | undefined;
  switch (astPosition.kind) {
    case "XMLElementOpenName":
      token = astPosition.astNode.syntax.openName;
      break;
    case "XMLElementCloseName":
      token = astPosition.astNode.syntax.closeName;
      break;
    case "XMLAttributeKey":
      token = astPosition.astNode.syntax.key;
      break;
    case "XMLAttributeValue":
      token = astPosition.astNode.syntax.value;
      break;
  }
  /* istanbul ignore if - defensive programming */
  if (token === undefined) {
    return undefined;
  }
  // endOffset is inclusive
  return Range.create(
    document.positionAt(token.startOffset),
    document.positionAt(token.endOffset + 1)
  );
}

function transformToLspHover(
  ui5Node: BaseUI5Node,
  model: UI5SemanticModel,
  range?: Range
): Hover | undefined {
  const hoverItem: Hover = {
    contents: addTitle(
      getNodeDetail(ui5Node),
      getNodeDocumentation(ui5Node, model)
    ),
    range,
  };
  return hoverItem;
}

function addTitle(title: string, documentation: MarkupContent): MarkupContent {
  const markupWithTitle = `\`${title.split("\n\n").join("`\n\n`")}\`\n\n---\n${
    documentation.value
  }`;
  return { kind: MarkupKind.Markdown, value: markupWithTitle };
}
