import { map } from "lodash";
import { flattenAggregations } from "../../src/api";
import {
  buildUI5Aggregation,
  buildUI5Class,
  expectUnsortedEquality
} from "@ui5-editor-tools/test-utils";

describe("The @ui5-editor-tools/logic-utils <flattenAggregations> function", () => {
  const aggregationA1 = buildUI5Aggregation({
    name: "aggregationA1",
    cardinality: "0..1"
  });
  const aggregationA2 = buildUI5Aggregation({ name: "aggregationA2" });
  const clazzA = buildUI5Class({
    name: "A",
    library: "sap.ui.core",
    aggregations: [aggregationA1, aggregationA2]
  });

  const aggregationB1 = buildUI5Aggregation({
    name: "aggregationB1",
    cardinality: "0..1"
  });
  const aggregationB2 = buildUI5Aggregation({ name: "aggregationB2" });
  const clazzB = buildUI5Class({
    name: "B",
    extends: clazzA,
    aggregations: [aggregationB1, aggregationB2]
  });

  const clazzC = buildUI5Class({ name: "C", extends: clazzA });

  it("direct aggregations", () => {
    const actualNames = map(flattenAggregations(clazzA), "name");
    expectUnsortedEquality(actualNames, ["aggregationA1", "aggregationA2"]);
  });

  it("borrowed aggregations", () => {
    const actualNames = map(flattenAggregations(clazzC), "name");
    expectUnsortedEquality(actualNames, ["aggregationA1", "aggregationA2"]);
  });

  it("direct and borrowed aggregations", () => {
    const actualNames = map(flattenAggregations(clazzB), "name");
    expectUnsortedEquality(actualNames, [
      "aggregationA1",
      "aggregationA2",
      "aggregationB1",
      "aggregationB2"
    ]);
  });
});
