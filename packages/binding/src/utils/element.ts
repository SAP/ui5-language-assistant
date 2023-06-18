import { BindContext, PropertyType } from "../types";
import {
  BOOLEAN_VALUE,
  LEFT_CURLY,
  LEFT_SQUARE,
  BindingParserTypes as BindingTypes,
  RIGHT_CURLY,
  RIGHT_SQUARE,
  STRING_VALUE,
} from "@ui5-language-assistant/binding-parser";
import { Range } from "vscode-languageserver-types";
const isNumber = (input: number | undefined): input is number => {
  return input !== undefined;
};
const emptyString = (context: BindContext, tabStop: number | undefined) => {
  let emptyString = context.doubleQuotes ? `''` : `""`;
  if (isNumber(tabStop)) {
    emptyString = context.doubleQuotes
      ? `'${"$" + tabStop}'`
      : `"${"$" + tabStop}"`;
  }
  return emptyString;
};
export const typesToValue = (
  types: PropertyType[],
  context: BindContext,
  tabStop?: number | undefined,
  collectionValue = false
): string[] => {
  const result: string[] = [];
  types.forEach((type) => {
    if (type.kind === "string") {
      if (type.collection && collectionValue === false) {
        result.push(`[${emptyString(context, tabStop)}]`);
      } else {
        result.push(emptyString(context, tabStop));
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
        result.push(isNumber(tabStop) ? `[{${"$" + tabStop}}]` : "[{ }]");
      } else {
        result.push(isNumber(tabStop) ? `{${"$" + tabStop}}` : "{ }");
      }
    }
  });
  return result;
};

export const valueTypeMap = new Map([
  [STRING_VALUE, "string"],
  [BOOLEAN_VALUE, "boolean"],
  [LEFT_SQUARE, "array"],
  [RIGHT_SQUARE, "array"],
  [RIGHT_CURLY, "object"],
  [LEFT_CURLY, "object"],
]);

export const isParts = (element: BindingTypes.StructureElement): boolean => {
  const text = element.key && element.key.text;
  return text === "parts";
};

export const defaultRange = (): Range => {
  return Range.create({ line: 0, character: 0 }, { line: 0, character: 0 });
};
export const findRange = (args: (Range | undefined)[]): Range => {
  const range = args.find((i) => !!i);
  if (range) {
    return range;
  }
  return defaultRange();
};
