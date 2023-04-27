export { parsePropertyBindingInfo } from "./parser/index";
export { PropertyBindingInfoTypes } from "./types";

import {
  Value,
  PrimitiveValue,
  CollectionValue,
  StructureValue,
  Ast,
} from "./types/property-binding-info";
/**
 * A value is considered as primitive if it does not have any elements
 */
export const isPrimitiveValue = (
  value: Value | undefined
): value is PrimitiveValue => {
  if (!value) {
    return false;
  }

  if ((value as Ast).elements) {
    return false;
  }
  return true;
};

export const isCollectionValue = (
  value: Value | undefined
): value is CollectionValue => {
  if (!value) {
    return false;
  }
  const collection = value as CollectionValue;
  if (collection.leftSquare || collection.rightSquare) {
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
  const collection = value as StructureValue;
  if (collection.leftCurly || collection.rightCurly) {
    return true;
  }

  return false;
};
