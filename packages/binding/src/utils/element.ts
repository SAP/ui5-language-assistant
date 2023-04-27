import { PropertyType } from "../types";
import { PropertyBindingInfoTypes as BindingTypes } from "@ui5-language-assistant/binding-parser";

export const typesToValue = (
  types: PropertyType[],
  collectionValue = false
): string[] => {
  const result: string[] = [];
  types.forEach((type) => {
    if (type.kind === "string") {
      if (type.collection && collectionValue === false) {
        result.push(`['']`);
      } else {
        result.push(`' '`);
      }
    }
    if (type.kind === "boolean") {
      if (type.collection && collectionValue === false) {
        result.push("[true, false]");
      } else {
        result.push("true");
        result.push("false");
      }
    }
    if (type.kind === "object") {
      if (type.collection && collectionValue === false) {
        result.push("[{ }]");
      } else {
        result.push("{ }");
      }
    }
  });
  return result;
};

export const valueTypeMap = new Map([
  [BindingTypes.STRING_VALUE, "string"],
  [BindingTypes.BOOLEAN_VALUE, "boolean"],
  [BindingTypes.LEFT_SQUARE, "array"],
  [BindingTypes.RIGHT_SQUARE, "array"],
  [BindingTypes.RIGHT_CURLY, "object"],
  [BindingTypes.LEFT_CURLY, "object"],
]);
