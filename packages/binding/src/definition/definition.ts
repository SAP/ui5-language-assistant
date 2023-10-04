import {
  UI5Class,
  UI5Type,
} from "@ui5-language-assistant/semantic-model-types";
import { AGGREGATION_BINDING_INFO, PROPERTY_BINDING_INFO } from "../constant";
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

const buildType = (
  context: BindContext,
  type: UI5Type,
  name: string,
  collection = false,
  aggregation = false
): PropertyType[] => {
  const propertyType: PropertyType[] = [];
  switch (type.kind) {
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
      });
      break;
    case "UI5Enum":
      propertyType.push({
        kind: TypeKind.string,
        dependents: getFromMap(dependents, name, aggregation),
        notAllowedElements: getFromMap(notAllowedElements, name, aggregation),
        possibleValue: {
          fixed: true,
          values: type.fields.map((field) => ui5NodeToFQN(field)),
        },
        collection,
      });
      break;
    case "UI5Class":
      propertyType.push({
        kind: getClassKind(type.name),
        dependents: getFromMap(dependents, name, aggregation),
        notAllowedElements: getFromMap(notAllowedElements, name, aggregation),
        possibleValue: {
          fixed: false,
          values: getPossibleValuesForClass(context, type),
        },
        collection,
      });
      break;
    case "UI5Typedef":
      if (TypeKind[type.name]) {
        propertyType.push({
          kind: TypeKind[type.name],
          dependents: getFromMap(dependents, name, aggregation),
          notAllowedElements: getFromMap(notAllowedElements, name, aggregation),
          collection,
        });
      }
      break;
    case "UnionType":
      for (const unionType of type.types) {
        if (unionType.kind === "ArrayType" && unionType.type) {
          propertyType.push(...buildType(context, unionType.type, name, true));
        } else {
          propertyType.push(...buildType(context, unionType, name));
        }
      }
      break;
    case "ArrayType":
      if (type.type?.kind === "UI5Typedef") {
        propertyType.push(...buildType(context, type.type, name, true));
      }
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
    const builtType = buildType(context, type, name).reduce(
      (previous: PropertyType[], current: PropertyType) => {
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
      },
      []
    );
    elements.push({
      name: name,
      type: builtType,
      documentation: getDocumentation(context, property, aggregation, forHover),
    });
  }
  return elements;
};
