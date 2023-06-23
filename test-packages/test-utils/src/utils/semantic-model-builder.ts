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
  UI5EnumValue,
  UI5DeprecatedInfo,
  UI5Association,
} from "@ui5-language-assistant/semantic-model-types";

import { PartialWithName } from "../../api";

const baseUI5NodeDefaults: BaseUI5Node = {
  name: "",
  deprecatedInfo: undefined,
  experimentalInfo: undefined,
  description: undefined,
  kind: "",
  library: "",
  parent: undefined,
  since: undefined,
  visibility: "public",
};

export function buildUI5Property<T extends PartialWithName<UI5Prop>>(
  opts: T
): UI5Prop & Pick<T, keyof UI5Prop> {
  return {
    ...baseUI5NodeDefaults,
    default: "",
    kind: "UI5Prop",
    type: undefined,
    ...opts,
  };
}

export function buildUI5Field<T extends PartialWithName<UI5Field>>(
  opts: T
): UI5Field & Pick<T, keyof UI5Field> {
  return {
    ...baseUI5NodeDefaults,
    kind: "UI5Field",
    type: undefined,
    ...opts,
  };
}

export function buildUI5EnumValue<T extends PartialWithName<UI5EnumValue>>(
  opts: T
): UI5EnumValue & Pick<T, keyof UI5EnumValue> {
  return {
    ...baseUI5NodeDefaults,
    kind: "UI5EnumValue",
    ...opts,
  };
}

export function buildUI5Event<T extends PartialWithName<UI5Event>>(
  opts: T
): UI5Event & Pick<T, keyof UI5Event> {
  return {
    ...baseUI5NodeDefaults,
    kind: "UI5Event",
    ...opts,
  };
}

export function buildUI5Method<T extends PartialWithName<UI5Method>>(
  opts: T
): UI5Method & Pick<T, keyof UI5Method> {
  return {
    ...baseUI5NodeDefaults,
    kind: "UI5Method",
    ...opts,
  };
}

export function buildUI5Constructor<T extends Partial<UI5Constructor>>(
  opts: T
): UI5Constructor & Pick<T, keyof UI5Constructor> {
  return {
    ...baseUI5NodeDefaults,
    kind: "UI5Constructor",
    name: "",
    ...opts,
  };
}

export function buildUI5Association<T extends PartialWithName<UI5Association>>(
  opts: T
): UI5Association & Pick<T, keyof UI5Association> {
  return {
    ...baseUI5NodeDefaults,
    kind: "UI5Association",
    cardinality: "0..n",
    type: undefined,
    ...opts,
  };
}

export function buildUI5Class<T extends PartialWithName<UI5Class>>(
  opts: T
): UI5Class & Pick<T, keyof UI5Class> {
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
    ...opts,
  };
}

export function buildUI5Interface<T extends PartialWithName<UI5Interface>>(
  opts: T
): UI5Interface & Pick<T, keyof UI5Interface> {
  return {
    ...baseUI5NodeDefaults,
    kind: "UI5Interface",
    methods: [],
    events: [],
    ...opts,
  };
}

export function buildUI5Enum<T extends PartialWithName<UI5Enum>>(
  opts: T
): UI5Enum & Pick<T, keyof UI5Enum> {
  return {
    ...baseUI5NodeDefaults,
    kind: "UI5Enum",
    fields: [],
    ...opts,
  };
}

export function buildUI5Typedef<T extends PartialWithName<UI5Typedef>>(
  opts: T
): UI5Typedef & Pick<T, keyof UI5Typedef> {
  return {
    ...baseUI5NodeDefaults,
    kind: "UI5Typedef",
    properties: [],
    ...opts,
  };
}

export function buildUI5Function<T extends PartialWithName<UI5Function>>(
  opts: T
): UI5Function & Pick<T, keyof UI5Function> {
  return {
    ...baseUI5NodeDefaults,
    kind: "UI5Function",
    ...opts,
  };
}

export function buildUI5Namespace<T extends PartialWithName<UI5Namespace>>(
  opts: T
): UI5Namespace & Pick<T, keyof UI5Namespace> {
  return {
    ...baseUI5NodeDefaults,
    classes: {},
    fields: [],
    kind: "UI5Namespace",
    methods: [],
    namespaces: {},
    events: [],
    ...opts,
  };
}

export function buildUI5Aggregation<T extends PartialWithName<UI5Aggregation>>(
  opts: T
): UI5Aggregation & Pick<T, keyof UI5Aggregation> {
  return {
    ...baseUI5NodeDefaults,
    altTypes: [],
    cardinality: "0..n",
    kind: "UI5Aggregation",
    type: undefined,
    ...opts,
  };
}

export function buildUI5DeprecatedInfo<T extends Partial<UI5DeprecatedInfo>>(
  opts: T
): UI5DeprecatedInfo & Pick<T, keyof UI5DeprecatedInfo> {
  return {
    isDeprecated: true,
    since: undefined,
    text: undefined,
    ...opts,
  };
}

export function buildUI5Model<T extends Partial<UI5SemanticModel>>(
  opts: T
): UI5SemanticModel & Pick<T, keyof UI5SemanticModel> {
  return {
    includedLibraries: [],
    classes: {},
    enums: {},
    functions: {},
    namespaces: {},
    typedefs: {},
    version: "",
    interfaces: {},
    ...opts,
  };
}
