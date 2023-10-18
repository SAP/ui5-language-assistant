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
  /* istanbul ignore next */
  aggregation = false
): CompletionItem[] => {
  const { element } = valueContext;
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
  if (!isStructureValue(element.value)) {
    /* istanbul ignore next */
    return [];
  }
  if (!positionInside(element.value.range, position)) {
    /* istanbul ignore next */
    return [];
  }
  const referenceType = foundElement.type.find((i) => !!i.reference);
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
      (i) => /* istanbul ignore next */ i.possibleElements?.length
    );
    /* istanbul ignore next */
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
    /* istanbul ignore next */
    (i) => i.possibleElements?.length
  );
  /* istanbul ignore next */
  const data = possibleType?.possibleElements ?? [];
  return getCompletionItems(context, element.value, spaces, aggregation, data);
};
