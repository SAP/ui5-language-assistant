import {
  BaseUI5Node,
  UI5Namespace,
  UI5Class,
  UI5Aggregation,
  UI5SemanticModel
} from "@vscode-ui5/semantic-model-types";

import { PartialWithName } from "../../api";

const baseUI5NodeDefaults: BaseUI5Node = {
  name: "",
  deprecatedInfo: undefined,
  description: undefined,
  kind: "",
  library: "",
  // eslint rule disabled because our API allows returning "partially" valid UI5Nodes for ease of use
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  parent: undefined as any,
  since: undefined,
  visibility: "public"
};

export function buildUI5Class(opts: PartialWithName<UI5Class>): UI5Class {
  return {
    ...baseUI5NodeDefaults,
    aggregations: [],
    associations: [],
    // eslint rule disabled because our API allows returning "partially" valid classes for ease of use
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    ctor: undefined as any,
    events: [],
    extends: undefined,
    implements: [],
    kind: "UI5Class",
    methods: [],
    properties: [],
    defaultAggregation: undefined,
    ...opts
  };
}

export function buildUI5Namespace(
  opts: PartialWithName<UI5Namespace>
): UI5Namespace {
  return {
    ...baseUI5NodeDefaults,
    classes: {},
    fields: [],
    kind: "UI5Namespace",
    methods: [],
    namespaces: {},
    events: [],
    ...opts
  };
}

export function buildUI5Aggregation(
  opts: PartialWithName<UI5Aggregation>
): UI5Aggregation {
  return {
    ...baseUI5NodeDefaults,
    altTypes: [],
    cardinality: "0..n",
    kind: "UI5Aggregation",
    type: undefined,
    ...opts
  };
}

export function buildUI5Model(
  opts: PartialWithName<UI5SemanticModel>
): UI5SemanticModel {
  return {
    classes: {},
    enums: {},
    functions: {},
    namespaces: {},
    typedefs: {},
    version: "",
    interfaces: {},
    ...opts
  };
}
