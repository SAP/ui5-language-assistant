export { parseBinding } from "./parser/index";
export { BindingParserTypes } from "./types";
export * from "./constant";
export {
  isAfterAdjacentRange,
  isBefore,
  isBeforeAdjacentRange,
  positionContained,
  rangeContained,
  isBindingExpression,
  isMetadataPath,
  isModel,
  isBindingAllowed,
  extractBindingSyntax,
} from "./utils";

import {
  Value,
  PrimitiveValue,
  CollectionValue,
  StructureValue,
} from "./types/binding-parser";

export const isCollectionValue = (
  value: Value | undefined
): value is CollectionValue => {
  if (!value) {
    return false;
  }
  if ((value as CollectionValue).type === "collection-value") {
    return true;
  }

  return false;
};

export const isStructureValue = (
  value: Value | undefined
): value is StructureValue => {
  if (!value) {
    return false;
  }
  if ((value as StructureValue).type === "structure-value") {
    return true;
  }

  return false;
};

/**
 * A value is considered as primitive if it is not structure or collection value
 */
export const isPrimitiveValue = (
  value: Value | undefined
): value is PrimitiveValue => {
  if (!value) {
    return false;
  }

  if (isCollectionValue(value) || isStructureValue(value)) {
    return false;
  }

  return true;
};
