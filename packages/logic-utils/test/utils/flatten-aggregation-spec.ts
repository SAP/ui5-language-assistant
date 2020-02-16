import { expect } from "chai";
import { flattenAggregations } from "../../src/api";
import { UI5Aggregation, UI5Class } from "@vscode-ui5/semantic-model";
import { map } from "lodash";

describe("The @vscode-ui5/logic-utils <flattenAggregations> function", () => {
  const commonProps = {
    parent: undefined as any,
    description: undefined,
    since: undefined,
    deprecatedInfo: undefined
  };

  const aggregationA1: UI5Aggregation = {
    ...commonProps,
    altTypes: [],
    cardinality: "0..1",
    kind: "UI5Aggregation",
    library: "",
    name: "aggregationA1",
    type: "",
    visibility: "public"
  };

  const aggregationA2: UI5Aggregation = {
    ...commonProps,
    altTypes: [],
    cardinality: "0..n",
    kind: "UI5Aggregation",
    library: "",
    name: "aggregationA2",
    type: "",
    visibility: "public"
  };

  const clazzA: UI5Class = {
    ...commonProps,
    constructor: undefined as any,
    library: "sap.ui.core",
    name: "A",
    kind: "UI5Class",
    extends: undefined,
    visibility: "public",
    implements: [],
    methods: [],
    properties: [],
    aggregations: [aggregationA1, aggregationA2],
    associations: [],
    events: []
  };

  const aggregationB1: UI5Aggregation = {
    ...commonProps,
    altTypes: [],
    cardinality: "0..1",
    kind: "UI5Aggregation",
    library: "",
    name: "aggregationB1",
    type: "",
    visibility: "public"
  };

  const aggregationB2: UI5Aggregation = {
    ...commonProps,
    altTypes: [],
    cardinality: "0..n",
    kind: "UI5Aggregation",
    library: "",
    name: "aggregationB2",
    type: "",
    visibility: "public"
  };

  const clazzB: UI5Class = {
    ...commonProps,
    constructor: undefined as any,
    library: "sap.ui.core",
    name: "B",
    kind: "UI5Class",
    extends: clazzA,
    visibility: "public",
    implements: [],
    methods: [],
    properties: [],
    aggregations: [aggregationB1, aggregationB2],
    associations: [],
    events: []
  };

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
