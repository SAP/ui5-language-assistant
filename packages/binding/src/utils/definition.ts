import {
  UI5Aggregation,
  UI5Class,
  UI5ConstructorParameters,
  UI5Type,
} from "@ui5-language-assistant/semantic-model-types";
import {
  BindContext,
  BindingInfoElement,
  BindingInfoName,
  ClassName,
  Dependents,
  PropertyType,
  TypeKind,
} from "../types";
import { FILTER_OPERATOR } from "../constant";
import { ui5NodeToFQN } from "@ui5-language-assistant/logic-utils";
import { getSorterPossibleElement } from "../definition/sorter";
import { getFiltersPossibleElement } from "../definition/filter";
import { getDocumentation } from "./documentation";
import { forOwn } from "lodash";

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
 * Retrieves possible values from UI5 class which is extended.
 *
 * @param {BindContext} context - The binding context containing the UI5 model.
 * @param {UI5Class} type - The UI5 class type to find possible values for.
 * @returns {string[]} An array of possible values for the specified UI5 class.
 */
export const getPossibleValuesForClass = (
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

/**
 * Retrieves possible binding information elements for a given UI5 class.
 *
 * @param {Object} param - The parameters for retrieving possible elements.
 * @param {BindContext} param.context - The binding context containing the UI5 model.
 * @param {UI5Aggregation} [param.ui5Aggregation] - The UI5 aggregation information.
 * @param {boolean} [param.forHover=false] - Flag indicating if the elements are for hover information.
 * @param {UI5Class} param.type - The UI5 class type to find possible elements for.
 * @returns {BindingInfoElement[]} An array of possible binding information elements for the specified UI5 class.
 */
export const getPossibleElement = (param: {
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
      const name = sorterMap.get(constParam.name) ?? constParam.name;
      if (name === "vSorterInfo" && constParam.parameterProperties) {
        result.push(
          ...getConstructorParameterProperties({
            ...param,
            parameterProperties: constParam.parameterProperties,
          })
        );
        continue;
      }
      const reference = getReference(constParam.type);
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
    const vFilter = type.ctor?.parameters?.find(
      (i) => i.name === "vFilterInfo"
    );
    if (!vFilter) {
      // use fallback filter
      return getFiltersPossibleElement();
    }
    result.push(
      ...getConstructorParameterProperties({
        ...param,
        parameterProperties: vFilter.parameterProperties,
      })
    );
  }
  return result;
};

/**
 * Retrieves class kind based on the provided class name.
 * If the class name is not found in the classKind map, it falls back to TypeKind.string.
 */
const getClassKind = (name: string) =>
  classKind.get(name as ClassName) ?? TypeKind.string;

/**
 * Retrieves a reference to other element based on the provided UI5Type. Currently only for `filters`.
 *
 * @param {UI5Type} type - The type object to get the reference for.
 * @returns {string | undefined} The reference string if found, otherwise undefined.
 */
export function getReference(type: UI5Type): string | undefined {
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
}

const getFromMap = <T, U extends string>(
  map: Map<U, T[]>,
  name: U,
  /* istanbul ignore next */
  aggregation = false
): T[] => {
  return aggregation ? [] : map.get(name) ?? [];
};

/**
 * Builds a PropertyType array based on the provided parameters.
 *
 * @param {Object} param - The parameters for building the PropertyType array.
 * @param {BindContext} param.context - The binding context.
 * @param {UI5Type} param.type - The UI5 type.
 * @param {string} param.name - The name of the property.
 * @param {boolean} [param.collection=false] - Indicates if the property is a collection.
 * @param {UI5Aggregation} [param.ui5Aggregation] - The UI5 aggregation.
 * @param {boolean} [param.forHover=false] - Indicates if the property is for hover.
 * @param {string} [param.reference] - The reference string.
 * @returns {PropertyType[]} The built PropertyType array.
 */
export const buildType = (param: {
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

/**
 * Retrieves the constructor parameter properties.
 *
 * @param {Object} param - The parameter object.
 * @param {BindContext} param.context - The binding context.
 * @param {UI5ConstructorParameters[]} param.parameterProperties - The UI5 constructor parameters.
 * @param {UI5Aggregation} [param.ui5Aggregation] - The UI5 aggregation.
 * @param {boolean} [param.forHover=false] - Indicates if the properties are for hover.
 * @param {UI5Class} param.type - The UI5 class type.
 * @returns {BindingInfoElement[]} The array of binding information elements.
 */
export function getConstructorParameterProperties(param: {
  context: BindContext;
  parameterProperties: UI5ConstructorParameters[];
  ui5Aggregation?: UI5Aggregation;
  forHover?: boolean;
  type: UI5Class;
}): BindingInfoElement[] {
  const result: BindingInfoElement[] = [];
  const {
    ui5Aggregation,
    forHover = false,
    type,
    context,
    parameterProperties,
  } = param;
  for (const param of parameterProperties) {
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

  return result;
}
