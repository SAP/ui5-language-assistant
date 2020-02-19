import { expect } from "chai";
import { flattenAggregations } from "../../src/api";
import { buildUI5Class, buildUI5Aggregation } from "@vscode-ui5/test-utils";
import { map } from "lodash";

describe("The @vscode-ui5/logic-utils <flattenAggregations> function", () => {
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

  it("will return `direct` aggregations", () => {
    const aggregations = flattenAggregations(clazzA);
    const actualAggregationNames = map(aggregations, "name");
    expect(actualAggregationNames).to.have.lengthOf(2);
    expect(actualAggregationNames).to.include.members([
      "aggregationA1",
      "aggregationA2"
    ]);
  });

  it("will return `borrowed` aggregations", () => {
    const aggregations = flattenAggregations(clazzB);
    const actualAggregationNames = map(aggregations, "name");
    expect(actualAggregationNames).to.have.lengthOf(4);
    expect(actualAggregationNames).to.include.members([
      "aggregationA1",
      "aggregationA2",
      "aggregationB1",
      "aggregationB2"
    ]);
  });
});
