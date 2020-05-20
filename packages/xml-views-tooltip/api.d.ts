import {
  XMLElementOpenName,
  XMLElementCloseName,
  XMLAttributeKey,
  XMLAttributeValue,
} from "@xml-tools/ast-position";
import {
  UI5SemanticModel,
  BaseUI5Node,
} from "@ui5-language-assistant/semantic-model-types";

export declare function findUI5HoverNodeAtOffset(
  visitor:
    | XMLElementOpenName
    | XMLElementCloseName
    | XMLAttributeKey
    | XMLAttributeValue
    | undefined,
  model: UI5SemanticModel
): BaseUI5Node | undefined;
