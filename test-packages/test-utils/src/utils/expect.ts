import { expect, use } from "chai";
import deepEqualInAnyOrder = require("deep-equal-in-any-order");

use(deepEqualInAnyOrder);

export function expectUnsortedEquality(
  actual: string[],
  expected: string[]
): void {
  expect(actual).to.deep.equalInAnyOrder(expected);
}
