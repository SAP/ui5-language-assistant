import {
  buildUI5Class,
  buildUI5Property,
  expectUnsortedEquality,
} from "@ui5-language-assistant/test-utils";
import { map } from "lodash";
import { flattenProperties } from "../../src/api";

describe("The @ui5-language-assistant/logic-utils <flattenAggregations> function", () => {
  const propA1 = buildUI5Property({ name: "propA1" });
  const propA2 = buildUI5Property({ name: "propA2" });
  const clazzA = buildUI5Class({
    name: "A",
    library: "sap.ui.core",
    properties: [propA1, propA2],
  });

  const propB1 = buildUI5Property({ name: "propB1" });
  const propB2 = buildUI5Property({ name: "propB2" });
  const clazzB = buildUI5Class({
    name: "B",
    extends: clazzA,
    properties: [propB1, propB2],
  });

  const clazzC = buildUI5Class({ name: "C", extends: clazzA });

  it("direct properties", () => {
    const actualNames = map(flattenProperties(clazzA), "name");
    expectUnsortedEquality(actualNames, ["propA1", "propA2"]);
  });

  it("borrowed properties", () => {
    const actualNames = map(flattenProperties(clazzC), "name");
    expectUnsortedEquality(actualNames, ["propA1", "propA2"]);
  });

  it("direct and borrowed properties", () => {
    const actualNames = map(flattenProperties(clazzB), "name");
    expectUnsortedEquality(actualNames, [
      "propA1",
      "propA2",
      "propB1",
      "propB2",
    ]);
  });
});
