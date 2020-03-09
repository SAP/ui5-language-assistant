import {
  BaseUI5Node,
  UI5Namespace,
  UI5Class,
  UI5Aggregation,
  UI5Prop,
  UI5Event,
  UI5SemanticModel
} from "@vscode-ui5/semantic-model-types";

import { PartialWithName } from "../../api";

const baseUI5NodeDefaults: BaseUI5Node = {
  name: "",
  deprecatedInfo: undefined,
  description: undefined,
  kind: "",
  library: "",
  parent: undefined,
  since: undefined,
  visibility: "public"
};

export function buildUI5Property(opts: PartialWithName<UI5Prop>): UI5Prop {
  return {
    ...baseUI5NodeDefaults,
    default: "",
    kind: "UI5Prop",
    type: undefined,
    ...opts
  };
}

export function buildUI5Event(opts: PartialWithName<UI5Event>): UI5Event {
  return {
    ...baseUI5NodeDefaults,
    kind: "UI5Event",
    ...opts
  };
}

export function buildUI5Class(opts: PartialWithName<UI5Class>): UI5Class {
  return {
    ...baseUI5NodeDefaults,
    aggregations: [],
    associations: [],
    ctor: undefined,
    events: [],
    extends: undefined,
    implements: [],
    kind: "UI5Class",
    methods: [],
    properties: [],
    fields: [],
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
  opts: Partial<UI5SemanticModel>
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
