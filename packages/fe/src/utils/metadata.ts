import type { AnnotationBase, AnnotationTerm } from "../types";
import type {
  ConvertedMetadata,
  EntityType,
  EntitySet,
  Singleton,
  NavigationProperty,
  Property,
  EntityContainer,
} from "@sap-ux/vocabularies-types";
import { getNextPossiblePathTargets } from "./path";

export type AllowedTargetType =
  | "EntitySet"
  | "EntityType"
  | "Singleton"
  | "NavigationProperty"
  | "Property";
type MetadataElementTypes = AllowedTargetType | "EntityContainer";

export const TypeNameMap: Record<MetadataElementTypes, string> = {
  EntityContainer: "Edm.EntityContainer",
  EntitySet: "Edm.EntitySet",
  EntityType: "Edm.EntityType",
  NavigationProperty: "Edm.NavigationProperty",
  Property: "Edm.Property",
  Singleton: "Edm.Singleton",
};

export function getEntityTypeForElement(
  element: EntitySet | EntityType | Singleton
): EntityType {
  return element._type === "EntityType" ? element : element.entityType;
}

export function getRootElements(
  metadata: ConvertedMetadata,
  allowedTerms: AnnotationTerm[] | undefined,
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

  result = result.filter((item) => {
    if (item._type === "EntityContainer") {
      return (
        getNextPossiblePathTargets(
          metadata,
          item,
          false,
          {
            allowedTerms,
            allowedTargets,
            isPropertyPath: isPropertyPath,
          },
          []
        ).length > 0
      );
    }
    const entityType = getEntityTypeForElement(item);
    if (!allowedTerms || allowedTerms.length === 0) {
      return true; // no term restrictions
    }
    const annotationList = collectAnnotationsForElement(
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
        allowedTargets,
        isPropertyPath: isPropertyPath,
      },
      [entityType.fullyQualifiedName]
    );

    return nextPossibleTargets.length > 0;
  });

  return result;
}

export function collectAnnotationsForElement(
  allowedTerms: AnnotationTerm[],
  element: EntityType | EntitySet | Singleton | undefined,
  property?: string,
  navigationProperty?: string
): AnnotationBase[] {
  const matchedAnnotations: AnnotationBase[] = [];

  if (!element) {
    return [];
  }
  const type: EntityType | undefined = getEntityTypeForElement(element);
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
    target = type.navigationProperties.find(
      (p) => p.name === navigationProperty
    );
  } else {
    target = element;
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

export function getAnnotationAppliedOnElement(
  metadata: ConvertedMetadata,
  allowedTerms: AnnotationTerm[],
  target: EntityContainer | EntitySet | EntityType | Singleton,
  navigationProperty?: string,
  property?: string
): AnnotationBase[] {
  if (target._type === "EntityContainer") {
    return [];
  }
  const result = collectAnnotationsForElement(
    allowedTerms,
    target,
    property,
    navigationProperty
  );
  if (["EntitySet", "Singleton"].includes(target._type)) {
    result.push(
      ...collectAnnotationsForElement(
        allowedTerms,
        (target as EntitySet | Singleton).entityType,
        property,
        navigationProperty
      )
    );
  }
  return result;
}
