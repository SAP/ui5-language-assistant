import {
  UI5Class,
  UI5Type,
} from "@ui5-language-assistant/semantic-model-types";
import {
  AGGREGATION_BINDING_INFO,
  FILTER_OPERATOR,
  PROPERTY_BINDING_INFO,
} from "../api";
import {
  BindContext,
  BindingInfoElement,
  BindingInfoName,
  PropertyType,
  TypeKind,
  Dependents,
  ClassName,
} from "../types";
import { ui5NodeToFQN } from "@ui5-language-assistant/logic-utils";
import { forOwn } from "lodash";
import { getAltTypesPrime, getDocumentation } from "../utils";
import { getFallBackElements } from "./fall-back-definition";
import { getSorterPossibleElement } from "./sorter";
import { getFiltersPossibleElement } from "./filter";
import type {
  UI5Aggregation,
  UI5TypedefProp,
} from "@ui5-language-assistant/semantic-model-types";

const notAllowedElements: Map<BindingInfoName, BindingInfoName[]> = new Map([
  [BindingInfoName.path, [BindingInfoName.parts, BindingInfoName.value]],
  [BindingInfoName.value, [BindingInfoName.parts, BindingInfoName.path]],
  [BindingInfoName.parts, [BindingInfoName.value, BindingInfoName.path]],
]);
const dependents: Map<BindingInfoName, Dependents[]> = new Map([
  [
    BindingInfoName.constraints,
    [
      {
        name: BindingInfoName.type,
        type: [
          {
            kind: TypeKind.string,
            dependents: [],
            notAllowedElements: [],
          },
        ],
      },
    ],
  ],
  [
    BindingInfoName.formatOptions,
    [
      {
        name: BindingInfoName.type,
        type: [
          {
            kind: TypeKind.string,
            dependents: [],
            notAllowedElements: [],
          },
        ],
      },
    ],
  ],
]);
const defaultBoolean: Map<string, boolean[]> = new Map([
  ["Boolean", [true, false]],
  ["boolean", [true, false]],
]);
const classKind: Map<ClassName, TypeKind> = new Map([
  [ClassName.Sorter, TypeKind.object],
  [ClassName.Filter, TypeKind.object],
]);

/**
 * Retrieves class kind based on the provided class name.
 * If the class name is not found in the classKind map, it falls back to TypeKind.string.
 */

const getClassKind = (name: string) =>
  classKind.get(name as ClassName) ?? TypeKind.string;

const getReference = (type: UI5Type) => {
  let reference;
  switch (type.kind) {
    case "PrimitiveType":
    case "UI5Enum":
    case "UI5Class":
    case "UI5Typedef":
      if (type.name === ClassName.Filter) {
        reference = "filters";
      }
      break;
    case "ArrayType":
      if (type.type) {
        reference = getReference(type.type);
      }
      break;
    case "UnionType":
      for (const t of type.types) {
        reference = getReference(t);
        if (reference) {
          break;
        }
      }
      break;
    default:
      break;
  }
  return reference;
};

/**
 * Currently [api.json](https://ui5.sap.com/1.118.1/test-resources/sap/ui/core/designtime/api.json) provides these constructor parameters as old school convention
 * e.g `sPath` for `path` where `s` stands for string type. These params are [map in runtime](https://github.com/SAP/openui5/blob/master/src/sap.ui.core/src/sap/ui/model/Sorter.js#L54-L60).
 * We build a map to overcome old school convention
 */
const sorterMap = new Map([
  ["sPath", "path"],
  ["path", "path"],
  ["bDescending", "descending"],
  ["descending", "descending"],
  ["vGroup", "group"],
  ["group", "group"],
  ["fnComparator", "comparator"],
  ["comparator", "comparator"],
]);
const getPossibleElement = (param: {
  context: BindContext;
  ui5Aggregation?: UI5Aggregation;
  forHover?: boolean;
  type: UI5Class;
}): BindingInfoElement[] => {
  const result: BindingInfoElement[] = [];
  /* istanbul ignore next */
  const { ui5Aggregation, forHover = false, type, context } = param;
  if (type.name === ClassName.Sorter) {
    const parameters = type.ctor && type.ctor.parameters;
    if (!parameters) {
      return getSorterPossibleElement();
    }
    for (const constParam of parameters) {
      if (!constParam.type) {
        continue;
      }
      const reference = getReference(constParam.type);
      const name = sorterMap.get(constParam.name) ?? constParam.name;
      const data: BindingInfoElement = {
        name,
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        type: buildType({
          context,
          type: constParam.type,
          name,
          collection: false,
          ui5Aggregation,
          forHover,
          reference,
        }),
        documentation: getDocumentation({
          context,
          prop: constParam,
          FQN: ui5NodeToFQN(type),
          titlePrefix: "(class)",
          forHover,
        }),
      };
      data.required = !constParam.optional;
      result.push(data);
    }
  }

  if (type.name === ClassName.Filter) {
    // for filters only try `vFilterInfo` from constructor
    /* istanbul ignore next */
    const vFilter = type.ctor?.parameters.find((i) => i.name === "vFilterInfo");
    if (!vFilter) {
      // use fallback filter
      return getFiltersPossibleElement();
    }
    for (const param of vFilter.parameterProperties) {
      if (!param.type) {
        continue;
      }
      // add reference to type and avoid recursion
      const paramType = param.type;
      const reference = getReference(paramType);
      const data: BindingInfoElement = {
        name: param.name,
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        type: buildType({
          context,
          type: paramType,
          name: param.name,
          collection: false,
          ui5Aggregation,
          forHover,
          reference,
        }),
        documentation: getDocumentation({
          context,
          prop: param,
          FQN: ui5NodeToFQN(type),
          titlePrefix: "(class)",
          forHover,
        }),
      };
      data.required = !param.optional;
      result.push(data);
    }
  }
  return result;
};

const getPossibleValuesForClass = (
  context: BindContext,
  type: UI5Class
): string[] => {
  const result: string[] = [];
  forOwn(context.ui5Model.classes, (value, key) => {
    let clzExtends = value.extends;
    while (clzExtends !== undefined) {
      if (clzExtends.name === type.name && clzExtends.kind === type.kind) {
        result.push(key);
        break;
      }
      clzExtends = clzExtends.extends;
    }
  });

  return result;
};

const getFromMap = <T, U extends string>(
  map: Map<U, T[]>,
  name: U,
  /* istanbul ignore next */
  aggregation = false
): T[] => {
  return aggregation ? [] : map.get(name) ?? [];
};

const buildType = (param: {
  context: BindContext;
  type: UI5Type;
  name: string;
  collection?: boolean;
  ui5Aggregation?: UI5Aggregation;
  forHover?: boolean;
  reference?: string;
}): PropertyType[] => {
  /* istanbul ignore next */
  const {
    collection = false,
    ui5Aggregation,
    forHover = false,
    context,
    type,
    name,
    reference,
  } = param;
  const aggregation = !!ui5Aggregation;
  const propertyType: PropertyType[] = [];
  switch (type.kind) {
    case "UI5Any": {
      propertyType.push({
        kind: TypeKind[type.name],
        dependents: getFromMap(dependents, name, aggregation),
        notAllowedElements: getFromMap(notAllowedElements, name, aggregation),
        collection,
        reference,
      });
      break;
    }
    case "PrimitiveType":
      propertyType.push({
        kind: TypeKind[type.name],
        dependents: getFromMap(dependents, name, aggregation),
        notAllowedElements: getFromMap(notAllowedElements, name, aggregation),
        possibleValue: {
          fixed: !!defaultBoolean.get(type.name),
          values: getFromMap(defaultBoolean, type.name, aggregation),
        },
        collection,
        reference,
      });
      break;
    case "UI5Enum":
      propertyType.push({
        kind: TypeKind.string,
        dependents: getFromMap(dependents, name, aggregation),
        notAllowedElements: getFromMap(notAllowedElements, name, aggregation),
        possibleValue: {
          fixed: true,
          values: type.fields.map((field) => {
            /**
             * filter operator accepts `BT` as value in XML instead of FQN `sap.ui.model.FilterOperator.BT`
             */
            if (type.name === FILTER_OPERATOR) {
              return field.name;
            }
            return ui5NodeToFQN(field);
          }),
        },
        collection,
        reference,
      });
      break;
    case "UI5Class":
      propertyType.push({
        kind: getClassKind(type.name),
        dependents: getFromMap(dependents, name, aggregation),
        notAllowedElements: getFromMap(notAllowedElements, name, aggregation),
        possibleElements: reference
          ? []
          : getPossibleElement({ context, ui5Aggregation, forHover, type }),
        possibleValue: {
          fixed: false,
          values: getPossibleValuesForClass(context, type),
        },
        collection,
        reference,
      });
      break;
    case "UI5Typedef":
      if (TypeKind[type.name]) {
        propertyType.push({
          kind: TypeKind[type.name],
          dependents: getFromMap(dependents, name, aggregation),
          notAllowedElements: getFromMap(notAllowedElements, name, aggregation),
          collection,
          reference,
        });
      }
      break;
    case "UnionType":
      for (const unionType of type.types) {
        if (unionType.kind === "ArrayType" && unionType.type) {
          propertyType.push(
            ...buildType({
              context,
              type: unionType.type,
              name,
              collection: true,
              ui5Aggregation,
              forHover,
              reference,
            })
          );
        } else {
          propertyType.push(
            ...buildType({
              context,
              type: unionType,
              name,
              collection,
              ui5Aggregation,
              forHover,
              reference,
            })
          );
        }
      }
      break;
    case "ArrayType":
      if (!type.type) {
        break;
      }
      propertyType.push(
        ...buildType({
          context,
          type: type.type,
          name,
          collection: true,
          ui5Aggregation,
          forHover,
          reference,
        })
      );
      break;
  }
  return propertyType;
};

const removeDuplicate = (builtType: PropertyType[]): PropertyType[] => {
  const result = builtType.reduce(
    (previous: PropertyType[], current: PropertyType) => {
      const index = previous.findIndex((i) => i.kind === current.kind);
      if (index === -1) {
        return [...previous, current];
      }
      // there is duplicate
      /* istanbul ignore next */
      if (current.possibleValue?.values.length !== 0) {
        // has possible value, remove previous - keep current
        return [...previous.slice(index), current];
      }
      /* istanbul ignore next */
      if (previous[index].possibleValue?.values.length !== 0) {
        // has possible value - keep it
        return previous;
      }
      return [...previous, current];
    },
    []
  );
  return result;
};

const processUI5TypedefProperties = (param: {
  properties: UI5TypedefProp[];
  context: BindContext;
  aggregation?: UI5Aggregation;
  forHover?: boolean;
}) => {
  const { properties, forHover = false, aggregation, context } = param;
  const elements: BindingInfoElement[] = [];
  for (const property of properties) {
    const { name, type } = property;
    if (!type) {
      /* istanbul ignore next */
      continue;
    }
    let builtType = buildType({
      context,
      type,
      name,
      collection: false,
      ui5Aggregation: aggregation,
      forHover,
    });
    builtType = removeDuplicate(builtType);
    const FQN = aggregation ? AGGREGATION_BINDING_INFO : PROPERTY_BINDING_INFO;
    const data: BindingInfoElement = {
      name: name,
      type: builtType,
      documentation: getDocumentation({
        context,
        prop: property,
        FQN,
        forHover,
      }),
    };
    if (property.optional === false) {
      data.required = true;
    }
    elements.push(data);
  }
  return elements;
};
export const getBindingElements = (
  context: BindContext,
  /* istanbul ignore next */
  aggregation: UI5Aggregation | undefined = undefined,
  /* istanbul ignore next */
  forHover = false
): BindingInfoElement[] => {
  const elements: BindingInfoElement[] = [];
  const propBinding = aggregation
    ? context.ui5Model.typedefs[AGGREGATION_BINDING_INFO]
    : context.ui5Model.typedefs[PROPERTY_BINDING_INFO];

  if (!propBinding) {
    return getFallBackElements(!!aggregation);
  }
  elements.push(
    ...processUI5TypedefProperties({
      context,
      forHover,
      aggregation,
      properties: propBinding.properties,
    })
  );
  const altTypes = getAltTypesPrime(aggregation);
  if (altTypes) {
    // if `altTypes`, add `PROPERTY_BINDING_INFO` properties too
    elements.push(
      ...processUI5TypedefProperties({
        properties: context.ui5Model.typedefs[PROPERTY_BINDING_INFO].properties,
        context,
        forHover,
      })
    );
  }

  return elements;
};
