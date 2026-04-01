import { expect, use } from "chai";
import { XMLAttribute, XMLElement } from "@xml-tools/ast";
import { map } from "lodash";
import deepEqualInAnyOrder = require("deep-equal-in-any-order");

use(deepEqualInAnyOrder);

// Generic type to avoid circular dependency with xml-views-completion
export type CompletionItem = {
  ui5Node?: unknown;
  astNode?: unknown;
  [key: string]: unknown;
};

export function expectUnsortedEquality(
  actual: string[],
  expected: string[]
): void {
  expect(actual).to.deep.equalInAnyOrder(expected);
}

export function expectXMLAttribute(
  astNode: XMLElement | XMLAttribute
): asserts astNode is XMLAttribute {
  expect(astNode.type).to.equal("XMLAttribute");
}

export function expectExists(value: unknown, message: string): asserts value {
  expect(value, message).to.exist;
}

export function expectProperty<T>(
  value: unknown,
  property: keyof T & string,
  message: string
): asserts value is T {
  expect(value, message).to.haveOwnProperty(property);
}

export function expectSuggestions<T = unknown>(
  actualNameGetter: (suggestion: T) => string,
  suggestions: T[],
  expected: string[]
): void {
  const suggestedNames = map(suggestions, actualNameGetter);
  expectUnsortedEquality(suggestedNames, expected);
}
