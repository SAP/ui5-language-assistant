import { expect, use } from "chai";
import { XMLAttribute, XMLElement } from "@xml-tools/ast";
import { UI5XMLViewCompletion } from "@ui5-language-assistant/xml-views-completion";
import { map } from "lodash";
import deepEqualInAnyOrder = require("deep-equal-in-any-order");

use(deepEqualInAnyOrder);

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
export function expectXMLAttribute02(
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

export function expectSuggestions(
  actualNameGetter: (suggestion: UI5XMLViewCompletion) => string,
  suggestions: UI5XMLViewCompletion[],
  expected: string[]
): void {
  const suggestedNames = map(suggestions, actualNameGetter);
  expectUnsortedEquality(suggestedNames, expected);
}
