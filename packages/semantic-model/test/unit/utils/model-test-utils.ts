import { isPlainObject } from "lodash";
import { expect } from "chai";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { forEachSymbol } from "../../../src/api";

export function isObject(value: unknown): value is Record<string, unknown> {
  return isPlainObject(value);
}

export function getFQN(
  model: UI5SemanticModel,
  target: unknown
): string | undefined {
  let fqn: string | undefined = undefined;
  forEachSymbol(model, (symbol, name) => {
    if (symbol === target) {
      fqn = name;
      return false;
    }
    return undefined;
  });
  return fqn;
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
