import {
  BindContext,
  BindingInfoElement,
  PropertyType,
  TypeKind,
} from "../types";
import {
  NUMBER_VALUE,
  BOOLEAN_VALUE,
  BindingParserTypes as BindingTypes,
  STRING_VALUE,
  isPrimitiveValue,
  COLLECTION_VALUE,
  STRUCTURE_VALUE,
} from "@ui5-language-assistant/binding-parser";
import { PARTS } from "../constant";
import { Range } from "vscode-languageserver-types";
import type { XMLAttribute } from "@xml-tools/ast";
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
export const typesToValue = ({
  types,
  context,
  tabStop,
  collectionValue = false,
  forDiagnostic = false,
}: {
  types: PropertyType[];
  context: BindContext;
  tabStop?: number | undefined;
  collectionValue?: boolean;
  forDiagnostic?: boolean;
}): string[] => {
  const result: string[] = [];
  types.forEach((type) => {
    if (type.kind === TypeKind.string) {
      if (type.collection && collectionValue === false) {
        result.push(`[${emptyString(context, tabStop)}]`);
      } else {
        result.push(emptyString(context, tabStop));
      }
    }
    if (type.kind === TypeKind.boolean) {
      if (type.collection && collectionValue === false) {
        result.push("[true, false]");
      } else {
        result.push("true");
        result.push("false");
      }
    }
    if (type.kind === TypeKind.integer && forDiagnostic) {
      if (type.collection && collectionValue === false) {
        result.push("collection of integer");
      } else {
        result.push("integer");
      }
    }
    if (type.kind === TypeKind.object) {
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
  [NUMBER_VALUE, "integer"],
  [COLLECTION_VALUE, "array"],
  [STRUCTURE_VALUE, "object"],
]);

export const isParts = (element: BindingTypes.StructureElement): boolean => {
  const text = element.key && element.key.text;
  return text === PARTS;
};

export const isAnyType = (
  element: BindingTypes.StructureElement,
  bindingElements: BindingInfoElement[]
): boolean => {
  const text = element.key && element.key.text;
  const bindingElement = bindingElements.find((el) => el.name === text);
  return !!bindingElement?.type.find((t) => t.kind === TypeKind.any);
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

/**
 * Get property binding info type which has default value
 */
export const getPropertyTypeWithPossibleValue = (
  element: BindingTypes.StructureElement,
  bindingInfo?: BindingInfoElement
): PropertyType | undefined => {
  if (!bindingInfo) {
    return undefined;
  }
  // currently only primitive value has possible value as per definition
  if (isPrimitiveValue(element.value)) {
    return bindingInfo.type.find(
      (i) =>
        i.kind === valueTypeMap.get(element.value?.type ?? "") &&
        i.possibleValue !== undefined
    );
  }

  return undefined;
};

/**
 * Return turn if it is `metaPath` or `contextPath` of `macros` namespace
 */
export const isMacrosMetaContextPath = (attribute: XMLAttribute): boolean => {
  if (!attribute.key) {
    return false;
  }
  if (
    ["metaPath", "contextPath"].includes(attribute.key) &&
    attribute.parent.ns === "macros"
  ) {
    return true;
  }
  return false;
};
