import { expect, use } from "chai";
import { XMLAttribute, XMLElement } from "@xml-tools/ast";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { getFQN } from "./model-test-utils";
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

export function expectTrue(
  condition: boolean,
  message: string
): asserts condition {
  expect(condition, message).to.be.true;
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

export function expectModelObjectsEqual(
  model: UI5SemanticModel,
  value: unknown,
  expectedValue: unknown,
  message: string
): void {
  // Using expect on expression because in case of error the diff generation creates an allocation failure error
  const result = value === expectedValue;
  // Only calling getFQN if the message will be used because it takes too long to calculate for every call to this function
  if (!result) {
    const valueName = getFQN(model, value) ?? (value as { name: string }).name;
    const expectedName =
      getFQN(model, expectedValue) ?? (expectedValue as { name: string }).name;
    message = `${message}: got ${valueName} instead of ${expectedName}`;
  }
  expect(result, message).to.be.true;
}

export function expectSuggestions<T extends UI5XMLViewCompletion>(
  actualNameGetter: (suggestion: T) => string,
  suggestions: T[],
  expected: string[]
): void {
  const suggestedNames = map(suggestions, actualNameGetter);
  expectUnsortedEquality(suggestedNames, expected);
}
