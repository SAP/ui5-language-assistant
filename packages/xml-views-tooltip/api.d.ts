import {
  XMLElementOpenName,
  XMLElementCloseName,
  XMLAttributeKey,
  XMLAttributeValue,
} from "@xml-tools/ast-position";
import { BaseUI5Node } from "@ui5-language-assistant/semantic-model-types";
import { Context } from "@ui5-language-assistant/context";

export declare function findUI5HoverNodeAtOffset(
  astPosition:
    | XMLElementOpenName
    | XMLElementCloseName
    | XMLAttributeKey
    | XMLAttributeValue,
  context: Context
): BaseUI5Node | undefined;
