import {
  BaseUI5Node,
  UI5Namespace,
  UI5Class,
  UI5Aggregation,
  UI5Prop,
  UI5Event,
  UI5SemanticModel,
  UI5Interface,
  UI5Enum,
  UI5Typedef,
  UI5Function,
  UI5Method,
  UI5Constructor,
  UI5Field,
  UI5EnumValue
} from "@ui5-language-assistant/semantic-model-types";

import { PartialWithName } from "../../api";
import { Ui5Association } from "@ui5-language-assistant/semantic-model/src/api-json";

const baseUI5NodeDefaults: BaseUI5Node = {
  name: "",
  deprecatedInfo: undefined,
  experimentalInfo: undefined,
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

export function buildUI5Field(opts: PartialWithName<UI5Field>): UI5Field {
  return {
    ...baseUI5NodeDefaults,
    kind: "UI5Field",
    type: undefined,
    ...opts
  };
}

export function buildUI5EnumValue(
  opts: PartialWithName<UI5EnumValue>
): UI5EnumValue {
  return {
    ...baseUI5NodeDefaults,
    kind: "UI5EnumValue",
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

export function buildUI5Method(opts: PartialWithName<UI5Method>): UI5Method {
  return {
    ...baseUI5NodeDefaults,
    kind: "UI5Method",
    ...opts
  };
}

export function buildUI5Constructor(
  opts: Partial<UI5Constructor>
): UI5Constructor {
  return {
    ...baseUI5NodeDefaults,
    kind: "UI5Constructor",
    name: "",
    ...opts
  };
}

export function buildUI5Association(
  opts: PartialWithName<Ui5Association>
): Ui5Association {
  return {
    ...baseUI5NodeDefaults,
    cardinality: undefined,
    deprecated: undefined,
    description: "",
    experimental: undefined,
    methods: [],
    name: undefined,
    since: undefined,
    singularName: undefined,
    type: "",
    visibility: undefined,
    ...opts
  };
}

export function buildUI5Class(opts: PartialWithName<UI5Class>): UI5Class {
  return {
    ...baseUI5NodeDefaults,
    abstract: false,
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

export function buildUI5Interface(
  opts: PartialWithName<UI5Interface>
): UI5Interface {
  return {
    ...baseUI5NodeDefaults,
    kind: "UI5Interface",
    methods: [],
    events: [],
    ...opts
  };
}

export function buildUI5Enum(opts: PartialWithName<UI5Enum>): UI5Enum {
  return {
    ...baseUI5NodeDefaults,
    kind: "UI5Enum",
    fields: [],
    ...opts
  };
}

export function buildUI5Typedef(opts: PartialWithName<UI5Typedef>): UI5Typedef {
  return {
    ...baseUI5NodeDefaults,
    kind: "UI5Typedef",
    ...opts
  };
}

export function buildUI5Function(
  opts: PartialWithName<UI5Function>
): UI5Function {
  return {
    ...baseUI5NodeDefaults,
    kind: "UI5Function",
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
