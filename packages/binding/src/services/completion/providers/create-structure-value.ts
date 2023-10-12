import { CompletionItem } from "vscode-languageserver-types";
import {
  isStructureValue,
  positionInside,
  BindingParserTypes as BindingTypes,
} from "@ui5-language-assistant/binding-parser";

import { BindContext, BindingInfoElement, ValueContext } from "../../../types";
import { getBindingElements } from "./../../../api";
import { getCompletionItems } from "./binding";

export const createStructureValue = (
  context: BindContext,
  spaces: BindingTypes.WhiteSpaces[],
  valueContext: ValueContext,
  bindingElements: BindingInfoElement[],
  aggregation = false
): CompletionItem[] => {
  const { element } = valueContext;
  const key = element.key?.text;
  const foundElement = bindingElements.find((i) => i.name === key);
  if (!foundElement) {
    return [];
  }
  /* istanbul ignore next */
  const position = context.textDocumentPosition?.position;
  if (!position) {
    return [];
  }
  if (!isStructureValue(element.value)) {
    return [];
  }
  if (!positionInside(element.value.range, position)) {
    return [];
  }
  const referenceType = foundElement.type.find((i) => !!i.reference);
  if (referenceType) {
    const [bdElement] = getBindingElements(context, aggregation).filter(
      (i) => i.name === referenceType.reference
    );
    if (!bdElement) {
      // currently checking reference to other binding element only
      return [];
    }

    const possibleType = bdElement.type.find((i) => i.possibleElements?.length);
    const data = possibleType?.possibleElements ?? [];
    return getCompletionItems(
      context,
      element.value,
      spaces,
      aggregation,
      data
    );
  }

  const possibleType = foundElement.type.find(
    (i) => i.possibleElements?.length
  );
  const data = possibleType?.possibleElements ?? [];
  return getCompletionItems(context, element.value, spaces, aggregation, data);
};
