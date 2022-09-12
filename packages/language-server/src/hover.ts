import {
  TextDocumentPositionParams,
  TextDocument,
  Hover,
  MarkupContent,
  MarkupKind,
} from "vscode-languageserver";
import {
  UI5SemanticModel,
  BaseUI5Node,
} from "@ui5-language-assistant/semantic-model-types";
import {
  getNodeDocumentation,
  getNodeDetail,
  getUI5NodeName,
} from "./documentation";
import { track } from "./swa";

export async function getHoverResponse(
  model: UI5SemanticModel,
  textDocumentPosition: TextDocumentPositionParams,
  document: TextDocument
): Promise<Hover | undefined> {
  const ui5Node = await getUI5NodeName(
    document.offsetAt(textDocumentPosition.position),
    document.getText(),
    model
  );
  if (ui5Node !== undefined) {
    track("XML_UI5_DOC_HOVER", ui5Node.kind);
    return transformToLspHover(ui5Node, model);
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
