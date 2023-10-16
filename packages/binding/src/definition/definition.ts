import {
  UI5Class,
  UI5Type,
} from "@ui5-language-assistant/semantic-model-types";
import {
  AGGREGATION_BINDING_INFO,
  FILTER_OPERATOR,
  PROPERTY_BINDING_INFO,
} from "../constant";
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
import { getDocumentation } from "../utils";
import { getFallBackElements } from "./fall-back-definition";
import { getSorterPossibleElement } from "./sorter";
import { getFiltersPossibleElement } from "./filter";

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

const getPossibleElement = (param: {
  context: BindContext;
  aggregation?: boolean;
  forHover?: boolean;
  type: UI5Class;
}): BindingInfoElement[] => {
  const { aggregation = false, forHover = false, type, context } = param;
  if (type.name === ClassName.Sorter) {
    return getSorterPossibleElement();
  }
  const result: BindingInfoElement[] = [];
  if (type.name === ClassName.Filter) {
    // for filters only try `vFilterInfo` from constructor
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
          aggregation,
          forHover,
          reference,
        }),
        documentation: getDocumentation(context, param, aggregation, forHover),
      };
      if (param.optional === false) {
        data.required = true;
      }
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
  aggregation = false
): T[] => {
  return aggregation ? [] : map.get(name) ?? [];
};

const buildType = (param: {
  context: BindContext;
  type: UI5Type;
  name: string;
  collection?: boolean;
  aggregation?: boolean;
  forHover?: boolean;
  reference?: string;
}): PropertyType[] => {
  const {
    collection = false,
    aggregation = false,
    forHover = false,
    context,
    type,
    name,
    reference,
  } = param;
  const propertyType: PropertyType[] = [];
  switch (type.kind) {
    case "UnresolvedType": {
      if (type.name === "any") {
        propertyType.push({
          kind: TypeKind[type.name],
          dependents: getFromMap(dependents, name, aggregation),
          notAllowedElements: getFromMap(notAllowedElements, name, aggregation),
          collection,
          reference,
        });
      }
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
          : getPossibleElement({ context, aggregation, forHover, type }),
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
              aggregation,
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
              aggregation,
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
          aggregation,
          forHover,
          reference,
        })
      );
      break;
  }
  return propertyType;
};

export const getBindingElements = (
  context: BindContext,
  aggregation = false,
  forHover = false
): BindingInfoElement[] => {
  const elements: BindingInfoElement[] = [];
  const propBinding = aggregation
    ? context.ui5Model.typedefs[AGGREGATION_BINDING_INFO]
    : context.ui5Model.typedefs[PROPERTY_BINDING_INFO];

  if (!propBinding) {
    return getFallBackElements(aggregation);
  }
  /* istanbul ignore next */
  const properties = propBinding.properties ?? [];
  for (const property of properties) {
    const { name, type } = property;
    if (!type) {
      /* istanbul ignore next */
      continue;
    }
    const builtType = buildType({
      context,
      type,
      name,
      collection: false,
      aggregation,
      forHover,
    }).reduce((previous: PropertyType[], current: PropertyType) => {
      const index = previous.findIndex((i) => i.kind === current.kind);
      if (index !== -1) {
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
      }
      return [...previous, current];
    }, []);
    const data: BindingInfoElement = {
      name: name,
      type: builtType,
      documentation: getDocumentation(context, property, aggregation, forHover),
    };
    if (property.optional === false) {
      data.required = true;
    }
    elements.push(data);
  }
  return elements;
};
