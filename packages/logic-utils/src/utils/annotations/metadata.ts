import {
  ConvertedMetadata,
  EntityType,
  EntitySet,
  Singleton,
  NavigationProperty,
  Property,
  EntityContainer,
} from "@sap-ux/vocabularies-types";
import { getNextPossiblePathTargets } from "./path";
import { AnnotationTerm } from "./spec";

// TODO: move it to some central place
// export enum AllowedTargetsType {
//   EntitySet = 'EntitySet',
//   EntityType = 'EntityType',
//   Singleton = 'Singleton',
//   NavigationProperty = 'NavigationProperty',
//   Property = 'Property',
// }

export type AllowedTargetType =
  | "EntitySet"
  | "EntityType"
  | "Singleton"
  | "NavigationProperty"
  | "Property";

export function getEntityTypeForElement(
  element: EntitySet | EntityType | Singleton
): EntityType | undefined {
  return element._type === "EntityType" ? element : element.entityType;
}

export function getRootElements(
  metadata: ConvertedMetadata,
  allowedTerms: AnnotationTerm[],
  allowedTargets: AllowedTargetType[],
  isPropertyPath: boolean
): (EntityContainer | EntitySet | EntityType | Singleton)[] {
  const isEntityContainerAllowed = ([
    "EntitySet",
    "Singleton",
  ] as AllowedTargetType[]).some((type) => allowedTargets.includes(type));
  let result: (
    | EntityContainer
    | EntitySet
    | EntityType
    | Singleton
  )[] = isEntityContainerAllowed ? [metadata.entityContainer] : [];
  result.push(
    ...(allowedTargets.includes("EntitySet") ? metadata.entitySets : [])
  );
  result.push(
    ...(allowedTargets.includes("Singleton") ? metadata.singletons : [])
  );
  result.push(
    ...(allowedTargets.includes("EntityType") ? metadata.entityTypes : [])
  );

  if (allowedTerms.length) {
    result = result.filter((item) => {
      if (item._type === "EntityContainer") {
        return (
          getNextPossiblePathTargets(
            metadata,
            item,
            false,
            {
              allowedTerms,
              isPropertyPath: isPropertyPath,
            },
            []
          ).length > 0
        );
      }
      const entityType = getEntityTypeForElement(item);
      if (!entityType) {
        return false;
      }
      const annotationList = collectAnnotationsForElement(
        metadata,
        allowedTerms,
        entityType
      );
      if (annotationList.length > 0) {
        return true;
      }
      const nextPossibleTargets = getNextPossiblePathTargets(
        metadata,
        entityType,
        false,
        {
          allowedTerms,
          isPropertyPath: isPropertyPath,
        },
        [entityType.fullyQualifiedName]
      );

      return nextPossibleTargets.length > 0;
    });
  }
  return result;
}

export function collectAnnotationsForElement(
  metadata: ConvertedMetadata,
  allowedTerms: AnnotationTerm[],
  element: string | EntityType | EntitySet | Singleton,
  property?: string,
  navigationProperty?: string
): any[] {
  const matchedAnnotations: any[] = [];

  const actualElement: EntityType | EntitySet | Singleton | undefined =
    typeof element === "string"
      ? [
          ...metadata.entityTypes,
          ...metadata.entitySets,
          ...metadata.singletons,
        ].find((entry) => entry.fullyQualifiedName === element)
      : element;
  if (!actualElement) {
    return [];
  }
  const type: EntityType | undefined = getEntityTypeForElement(actualElement);
  if (!type) {
    return [];
  }
  let target:
    | EntityType
    | EntitySet
    | Singleton
    | Property
    | NavigationProperty
    | undefined;
  if (property) {
    target = type.entityProperties.find((p) => p.name === property);
  } else if (navigationProperty) {
    target = type.navigationProperties.find((p) => p.name === property);
  } else {
    target = actualElement;
  }
  if (!target) {
    return [];
  }

  for (const term of allowedTerms) {
    const annotations = target.annotations[term.alias] || {};
    const paths = Object.keys(annotations);
    for (const path of paths) {
      const annotation = annotations[path];
      if (annotation.term === term.fullyQualifiedName) {
        matchedAnnotations.push(annotation);
      }
    }
  }
  return matchedAnnotations;
}
