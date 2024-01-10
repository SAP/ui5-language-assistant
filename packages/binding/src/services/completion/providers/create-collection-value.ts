import {
  CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
} from "vscode-languageserver-types";
import {
  isCollectionValue,
  BindingParserTypes as BindingTypes,
  isBefore,
  positionContained,
  isStructureValue,
  positionInside,
  isPrimitiveValue,
} from "@ui5-language-assistant/binding-parser";
import type { UI5Aggregation } from "@ui5-language-assistant/semantic-model-types";
import { isParts, typesToValue } from "../../../utils";
import {
  BindContext,
  BindingInfoElement,
  ValueContext,
  PropertyType,
} from "../../../types";
import { getCompletionItems } from "./binding";
import { getBindingElements } from "../../../api";
import { PARTS } from "../../../constant";

const getCompletionItemsByType = (
  context: BindContext,
  /* istanbul ignore next */
  types: PropertyType[] = []
): CompletionItem[] => {
  const data = typesToValue({
    types: types,
    context,
    tabStop: 0,
    collectionValue: true,
  });
  return data.map((item) => ({
    label: item.replace(/\$\d+/g, ""),
    insertTextFormat: InsertTextFormat.Snippet,
    insertText: item,
    kind: CompletionItemKind.Field,
  }));
};

export const createCollectionValue = (
  context: BindContext,
  spaces: BindingTypes.WhiteSpaces[],
  valueContext: ValueContext,
  bindingElements: BindingInfoElement[],
  aggregation?: UI5Aggregation
): CompletionItem[] => {
  const { element } = valueContext;
  if (!isCollectionValue(element.value)) {
    return [];
  }
  /* istanbul ignore next */
  const key = element.key?.text;
  const foundElement = bindingElements.find((i) => i.name === key);
  if (!foundElement) {
    /* istanbul ignore next */
    return [];
  }
  /* istanbul ignore next */
  const position = context.textDocumentPosition?.position;
  if (!position) {
    /* istanbul ignore next */
    return [];
  }
  if (!element.value.range) {
    /* istanbul ignore next */
    return [];
  }
  if (isBefore(position, element.value.range.start, true)) {
    // position is outside [] e.g |[]
    /* istanbul ignore next */
    return [];
  }
  if (isBefore(element.value.range.end, position, true)) {
    // position is outside [] e.g [] |
    /* istanbul ignore next */
    return [];
  }

  const el = element.value.elements
    .filter((item) => !!item)
    .find((item) => positionContained(item.range, position));

  const referenceType = foundElement.type.find((i) => !!i.reference);
  if (isStructureValue(el) && positionInside(el.range, position)) {
    if (isParts(element)) {
      // only for parts which can be any `PropertyBindingInfo` excluding itself
      return getCompletionItems(
        context,
        el,
        spaces,
        aggregation,
        bindingElements
      ).filter((item) => item.label !== PARTS);
    }

    if (referenceType) {
      const [bdElement] = getBindingElements(context, aggregation).filter(
        (i) => i.name === referenceType.reference
      );
      if (!bdElement) {
        // currently checking reference to other binding element only
        /* istanbul ignore next */
        return [];
      }
      const possibleType = bdElement.type.find(
        /* istanbul ignore next */
        (i) => i.possibleElements?.length
      );
      /* istanbul ignore next */
      const data = possibleType?.possibleElements ?? [];
      return getCompletionItems(context, el, spaces, aggregation, data);
    }

    const possibleType = foundElement.type.find(
      /* istanbul ignore next */
      (i) => i.possibleElements?.length
    );
    /* istanbul ignore next */
    const data = possibleType?.possibleElements ?? [];
    return getCompletionItems(context, el, spaces, aggregation, data);
  }
  if (isPrimitiveValue(el)) {
    return [];
  }
  if (referenceType) {
    const [bdElement] = getBindingElements(context, aggregation).filter(
      (i) => i.name === referenceType.reference
    );
    if (!bdElement) {
      // currently checking reference to other binding element only
      /* istanbul ignore next */
      return [];
    }
    return getCompletionItemsByType(context, bdElement.type);
  }
  return getCompletionItemsByType(context, foundElement.type);
};
