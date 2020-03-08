import {
  BaseUI5Node,
  PrimitiveTypeName,
  UI5SemanticModel,
  UI5Type
} from "@vscode-ui5/semantic-model-types";
import { TypeNameFix } from "../api";
import { Symbol as JsonSymbol, Class } from "./apiJson";
import { error, getParentFqn, findValueInMaps } from "./utils";
import { forEach, has, find, map, compact, pickBy } from "lodash";

export function resolveSemanticProperties(
  model: UI5SemanticModel,
  symbols: Record<string, JsonSymbol>,
  typeNameFix: TypeNameFix,
  strict: boolean
): void {
  function setParent(
    model: UI5SemanticModel,
    fqn: string,
    symbol: BaseUI5Node
  ): void {
    const parentFqn = fixTypeName(getParentFqn(fqn, symbol.name), typeNameFix);
    if (parentFqn !== undefined) {
      // A limited set of objects have a class as their parent
      const parent = findValueInMaps<BaseUI5Node>(
        parentFqn,
        model.namespaces,
        model.classes
      );
      /* istanbul ignore if */
      if (parent === undefined) {
        error(
          `Namespace or class ${parentFqn} not found (should be parent of ${fqn})`,
          strict
        );
      }
      symbol.parent = parent;
    }
  }

  for (const key in model.classes) {
    const classs = model.classes[key];
    setParent(model, key, classs);
    const jsonSymbol = symbols[key] as Class;
    if (jsonSymbol.extends !== undefined) {
      const extendsType = resolveType(
        model,
        jsonSymbol.extends,
        typeNameFix,
        strict
      );
      // Ignore undefined and object types since they don't provide any type information for extends
      if (
        extendsType !== undefined &&
        !(extendsType.kind === "PrimitiveType" && extendsType.name === "Object")
      ) {
        /* istanbul ignore if */
        if (extendsType.kind !== "UI5Class") {
          error(
            `${jsonSymbol.extends} is a ${extendsType.kind} and not a class (class ${key} extends it)`,
            strict
          );
          continue;
        }
        classs.extends = extendsType;
      }
    }
    if (jsonSymbol.implements) {
      for (const interfacee of jsonSymbol.implements) {
        const interfaceType = resolveType(
          model,
          interfacee,
          typeNameFix,
          strict
        );
        if (interfaceType !== undefined) {
          /* istanbul ignore if */
          if (interfaceType.kind !== "UI5Interface") {
            error(
              `${interfacee} is a ${interfaceType.kind} and not an interface (class ${key} implements it)`,
              strict
            );
            continue;
          }
          classs.implements.push(interfaceType);
        }
      }
    }
    if (
      jsonSymbol["ui5-metadata"] !== undefined &&
      jsonSymbol["ui5-metadata"].defaultAggregation !== undefined
    ) {
      const defaultAggregation = jsonSymbol["ui5-metadata"].defaultAggregation;
      classs.defaultAggregation = find(
        classs.aggregations,
        _ => _.name === defaultAggregation
      );
      /* istanbul ignore if */
      if (classs.defaultAggregation === undefined) {
        error(
          `Unknown default aggregation ${defaultAggregation} in class ${key}`,
          strict
        );
      }
    }
    forEach(classs.properties, _ => {
      _.type = resolveType(model, _.type, typeNameFix, strict);
    });
    forEach(classs.fields, _ => {
      _.type = resolveType(model, _.type, typeNameFix, strict);
    });
    forEach(classs.aggregations, _ => {
      _.type = resolveType(model, _.type, typeNameFix, strict);
      _.altTypes = compact(
        map(_.altTypes, _ => resolveType(model, _, typeNameFix, strict))
      );
    });
    forEach(classs.associations, _ => {
      _.type = resolveType(model, _.type, typeNameFix, strict);
    });
  }

  for (const key in model.enums) {
    const enumm = model.enums[key];
    setParent(model, key, enumm);
  }

  for (const key in model.namespaces) {
    const namespace = model.namespaces[key];
    setParent(model, key, namespace);
    forEach(namespace.fields, _ => {
      _.type = resolveType(model, _.type, typeNameFix, strict);
    });
  }

  for (const key in model.interfaces) {
    const interfacee = model.interfaces[key];
    setParent(model, key, interfacee);
  }

  for (const key in model.typedefs) {
    const typedef = model.typedefs[key];
    setParent(model, key, typedef);
  }

  for (const key in model.functions) {
    const func = model.functions[key];
    setParent(model, key, func);
  }

  // This should be called after all of the setParent calls
  for (const key in model.namespaces) {
    const namespace = model.namespaces[key];
    namespace.namespaces = pickBy(
      model.namespaces,
      _ => _.parent === namespace
    );
    namespace.classes = pickBy(model.classes, _ => _.parent === namespace);
  }
}

function fixTypeName(
  fqn: string | undefined,
  typeNameFix: TypeNameFix
): string | undefined {
  if (fqn === undefined) {
    return undefined;
  }
  if (ignoreType(fqn)) {
    return undefined;
  }
  if (has(typeNameFix, fqn)) {
    return typeNameFix[fqn];
  }
  return fqn;
}

function resolveType(
  model: UI5SemanticModel,
  type: UI5Type | string | undefined,
  typeNameFix: TypeNameFix,
  strict: boolean
): UI5Type | undefined {
  // String types are unresolved
  if (typeof type === "string") {
    type = {
      kind: "UnresolvedType",
      name: type
    };
  }

  // Before resolving all types are UnresolvedType or undefined
  /* istanbul ignore if */
  if (type === undefined || type.kind !== "UnresolvedType") {
    return type;
  }

  const typeName = fixTypeName(type.name, typeNameFix);
  if (typeName === undefined) {
    return undefined;
  }

  const typeObj = findValueInMaps<UI5Type>(
    typeName,
    model.classes,
    model.interfaces,
    model.enums,
    model.namespaces,
    model.typedefs
  );
  if (typeObj !== undefined) {
    return typeObj;
  }

  const primitiveTypeName = getPrimitiveTypeName(typeName);
  if (primitiveTypeName !== undefined) {
    return {
      kind: "PrimitiveType",
      name: primitiveTypeName
    };
  }
  /* istanbul ignore else */
  if (typeName.endsWith("[]")) {
    const innerTypeName = typeName.substring(0, typeName.length - "[]".length);
    const innerType = resolveType(model, innerTypeName, typeNameFix, strict);
    return {
      kind: "ArrayType",
      type: innerType
    };
  } else {
    error(`Unknown type: ${typeName}`, strict);
    return {
      kind: "UnresolvedType",
      name: typeName
    };
  }
}

const apiJsonTypeToModelType: Record<string, PrimitiveTypeName> = {
  string: "String",
  boolean: "Boolean",
  number: "Number",
  int: "Integer",
  float: "Float",
  String: "String",
  Object: "Object",
  object: "Object",
  map: "Map",
  function: "Function"
};

function getPrimitiveTypeName(typeName: string): PrimitiveTypeName | undefined {
  return apiJsonTypeToModelType[typeName];
}

// These types don't have any specific type information
const typesToIgnore: Record<string, undefined> = {
  undefined: undefined,
  any: undefined
};
function ignoreType(typeName: string): boolean {
  return has(typesToIgnore, typeName);
}
