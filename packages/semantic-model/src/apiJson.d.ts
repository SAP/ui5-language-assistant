// Type definitions for UI5 api.json files
export interface LibraryFile {
  "$schema-ref": string;
  version: string;
  library?: string;
  symbols: (Namespace | Enum | FunctionSymbol | Typedef | Interface | Class)[];
}

export interface Metadata {
  static?: boolean;
  visibility: Visibility;
  description?: string;
  since?: string;
  deprecated?: {
    since?: string;
    text?: string;
  };
  experimental?: {
    since?: string;
    text?: string;
  };
  // Defined on functions, methods, constructors and one enum
  examples?: {
    caption?: string;
    text: string;
  }[];
  references?: string[];
}

export interface Symbol extends Metadata {
  kind: string;
  name: string;
  basename: string;
  resource: string;
  module: string;
  export?: string; // This should probably be required
  "ui5-metamodel"?: boolean;
}

export interface Namespace extends Symbol {
  kind: "namespace";
  "ui5-metadata"?: {
    stereotype?: Stereotype;
    basetype?: string;
    pattern?: string;
    range?: {
      minExclusive?: number;
      maxInclusive?: number;
      minInclusive?: number;
      maxExclusive?: number;
    };
  };
  properties?: Property[];
  methods?: Method[];
  final?: boolean;
  events?: Event[]; // This exists in 1 namespace and is probably a mistake
  abstract?: boolean; // This exists in 1 namespace and is probably a mistake
  extends?: string;
}

export interface Class extends Symbol {
  kind: "class";
  extends?: string;
  "ui5-metadata"?: {
    stereotype?: Stereotype;
    metadataClass?: string;
    properties?: Property[];
    defaultProperty?: string; // This exists in 1 class and is probably a mistake
    aggregations?: Aggregation[];
    defaultAggregation?: string;
    associations?: Association[];
    events?: MetadataEvent[];
    designtime?: string;
    specialSettings?: SpecialSetting[]; // This is only defined on base objects like ManagedObject, XMLView, Fragment etc
    dnd?: Dnd;
  };
  // This confuses typescript due to the built-in constructor on Object and doesn't allow to use an object literal for the library if it contains a class symbol without a constructor
  // A workaround is to add the constructor property with undefined value to the object literal of the class symbol
  constructor?: Constructor;
  events?: Event[];
  methods?: Method[];
  implements?: string[];
  abstract?: boolean;
  properties?: Property[];
  final?: boolean;
}

export interface Enum extends Symbol {
  kind: "enum";
  properties?: EnumValue[];
  "ui5-metadata"?: {
    stereotype: Stereotype;
  };
}

export interface Interface extends Symbol {
  kind: "interface";
  methods?: Method[];
  events?: Event[];
}

export interface FunctionSymbol extends Symbol {
  kind: "function";
  parameters?: Parameter[];
  returnValue?: {
    type: string;
    description: string;
  };
  throws?: {
    type?: string;
    description?: string;
  }[];
}

export interface Typedef extends Symbol {
  kind: "typedef";
  properties?: Property[];
  parameters?: Parameter[];
  returnValue?: {
    type: string;
    description: string;
  };
}

export interface Constructor extends Metadata {
  parameters?: Parameter[];
  throws?: {
    type?: string;
    description?: string;
  }[];
}

export interface Method extends Constructor {
  name: string;
  returnValue?: {
    type?: string;
    description?: string;
  };
  optional?: boolean; // This is probably a mistake
  "ui5-metamodel"?: boolean;
  module?: string; // This is probably a mistake
  resource?: string; // This is probably a mistake
  export?: string; // This is probably a mistake
}

export interface Property extends Metadata {
  name: string;
  type: string;
  defaultValue?: unknown;
  group?: string;
  methods?: string[];
  bindable?: boolean;
  module?: string; // This is probably a mistake
  export?: string; // This is probably a mistake
  resource?: string; // This is probably a mistake
}

export interface EnumValue extends Property {
  value?: string | number;
}

export interface Aggregation extends Metadata {
  name: string;
  singularName: string;
  type: string;
  cardinality: Cardinality;
  bindable?: boolean;
  methods: string[];
  dnd?: Dnd;
  altTypes?: string[];
}
export interface Association extends Metadata {
  name: string;
  singularName: string;
  type: string;
  cardinality: Cardinality;
  methods: string[];
}
export interface MetadataEvent extends Metadata {
  name: string;
  parameters?: Record<string, EventParameter>;
  methods: string[];
}
export interface Event extends Metadata {
  name: string;
  parameters?: MetadataEventParameter[];
  module?: string; // This is probably a mistake
  resource?: string; // This is probably a mistake
}
export interface EventParameter {
  name: string;
  type: string;
  description?: string;
  since?: string;
  deprecated?: {
    since?: string;
    text?: string;
  };
}

export interface MetadataEventParameter {
  name: string;
  type: string;
  description?: string;
  defaultValue?: unknown;
  parameterProperties?: Record<string, Parameter>;
}
export interface Parameter extends MetadataEventParameter {
  optional: boolean;
}
export interface Dnd {
  draggable: boolean;
  droppable: boolean;
}
export interface SpecialSetting {
  name: string;
  type: string;
  visibility: string;
  since?: string;
  description?: string;
}
export type Visibility =
  | "public"
  | "private"
  | "protected"
  | "experimental"
  | "restricted"
  | "hidden";
export type Cardinality = "0..1" | "0..n";
export type Stereotype =
  | "object"
  | "control"
  | "element"
  | "datatype"
  | "component"
  | "enum"
  | "controller"
  | "controllerextension"
  | "template";
