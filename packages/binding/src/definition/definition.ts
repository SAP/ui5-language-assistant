import {
  UI5Class,
  UI5Type,
} from "@ui5-language-assistant/semantic-model-types";
import { PROPERTY_BINDING_INFO } from "../constant";
import {
  BindContext,
  PropertyBindingInfoElement,
  BindingInfoName,
  PropertyType,
  TypeKind,
  Dependents,
} from "../types";
import { ui5NodeToFQN } from "@ui5-language-assistant/logic-utils";
import { forOwn } from "lodash";
import { getDocumentation } from "../utils";
import { fallBackElements } from "./fall-back-definition";

const isBindingInfoName = (name: string): name is BindingInfoName => {
  return !!BindingInfoName[name];
};
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

const getFromMap = <T, U extends string>(map: Map<U, T[]>, name: U): T[] => {
  return map.get(name) ?? [];
};

const buildType = (
  context: BindContext,
  type: UI5Type,
  name: BindingInfoName,
  collection = false
): PropertyType[] => {
  const propertyType: PropertyType[] = [];
  switch (type.kind) {
    case "PrimitiveType":
      propertyType.push({
        kind: TypeKind[type.name],
        dependents: getFromMap(dependents, name),
        notAllowedElements: getFromMap(notAllowedElements, name),
        possibleValue: {
          fixed: !!defaultBoolean.get(type.name),
          values: getFromMap(defaultBoolean, type.name),
        },
        collection,
      });
      break;
    case "UI5Enum":
      propertyType.push({
        kind: TypeKind.string,
        dependents: getFromMap(dependents, name),
        notAllowedElements: getFromMap(notAllowedElements, name),
        possibleValue: {
          fixed: true,
          values: type.fields.map((field) => ui5NodeToFQN(field)),
        },
        collection,
      });
      break;
    case "UI5Class":
      propertyType.push({
        kind: TypeKind.string,
        dependents: getFromMap(dependents, name),
        notAllowedElements: getFromMap(notAllowedElements, name),
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
          dependents: getFromMap(dependents, name),
          notAllowedElements: getFromMap(notAllowedElements, name),
          collection,
        });
      }
      break;
    case "UnionType":
      for (const unionType of type.types) {
        propertyType.push(
          ...buildType(context, unionType, name, type.collection)
        );
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

export const getPropertyBindingInfoElements = (
  context: BindContext
): PropertyBindingInfoElement[] => {
  const elements: PropertyBindingInfoElement[] = [];
  const propBinding = context.ui5Model.typedefs[PROPERTY_BINDING_INFO];
  if (!propBinding) {
    return fallBackElements;
  }
  /* istanbul ignore next */
  const properties = propBinding.properties ?? [];
  for (const property of properties) {
    const { name, type } = property;
    if (!isBindingInfoName(name) || !type) {
      /* istanbul ignore next */
      continue;
    }
    const builtType = buildType(context, type, name).reduce(
      (previous: PropertyType[], current: PropertyType) => {
        const index = previous.findIndex((i) => i.kind === current.kind);
        if (index !== -1) {
          // there is duplicate
          if (current.possibleValue?.values.length !== 0) {
            // has possible value, remove previous - keep current
            return [...previous.slice(index), current];
          }
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
      documentation: getDocumentation(context, property),
    });
  }
  return elements;
};
