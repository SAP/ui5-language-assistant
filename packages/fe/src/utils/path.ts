import {
  ConvertedMetadata,
  EntityContainer,
  EntityType,
  EntitySet,
  Singleton,
  NavigationProperty,
  Property,
} from "@sap-ux/vocabularies-types";
import {
  AllowedTargetType,
  collectAnnotationsForElement,
  getEntityTypeForElement,
} from "./metadata";
import { AnnotationTerm } from "./spec";

export type ResolvedPathTargetType =
  | EntityContainer
  | EntityType
  | EntitySet
  | Singleton
  | Property;

export function resolvePathTarget(
  metadata: ConvertedMetadata,
  path: string,
  baseEntity?: EntityType
): {
  target: ResolvedPathTargetType | undefined;
  targetStructuredType?: EntityType | undefined;
  isCollection: boolean | undefined;
  lastValidSegmentIndex: number;
  isCardinalityIssue: boolean;
  milestones: string[];
} {
  const result: {
    target: ResolvedPathTargetType | undefined;
    targetStructuredType?: EntityType | undefined;
    isCollection: boolean | undefined;
    lastValidSegmentIndex: number;
    isCardinalityIssue: boolean;
    milestones: string[];
  } = {
    target: undefined,
    isCollection: undefined,
    lastValidSegmentIndex: -1,
    isCardinalityIssue: false,
    milestones: [],
  };

  let targetElement: ResolvedPathTargetType | undefined;
  let targetEntity: EntityType | undefined;
  const segments = path.split("/");
  const isAbsolutePath = path.startsWith("/");
  if (isAbsolutePath) {
    segments.shift();
    let segment = segments.shift();
    targetElement = [
      metadata.entityContainer,
      ...metadata.entityTypes,
      ...metadata.entitySets,
      ...metadata.singletons,
    ].find((entry) => [entry.name, entry.fullyQualifiedName].includes(segment));
    if (!targetElement) {
      return result;
    } else {
      result.target = targetElement;
      result.milestones.push(targetElement.fullyQualifiedName);
      result.lastValidSegmentIndex = 1;
      if (targetElement._type === "EntityContainer") {
        if (segments.length === 0) {
          return result;
        }
        segment = segments.shift();
        const entitySet = metadata.entitySets.find(
          (entry) => entry.name === segment
        );
        result.target = undefined;
        if (entitySet) {
          targetEntity = getEntityTypeForElement(entitySet);
          result.target = entitySet;
          result.lastValidSegmentIndex++;
          result.milestones.push(entitySet.fullyQualifiedName);
        }
      } else {
        targetEntity = getEntityTypeForElement(targetElement);
        result.milestones.push(targetEntity.fullyQualifiedName);
      }
    }
  } else {
    targetEntity = baseEntity;
    result.milestones.push(targetEntity?.fullyQualifiedName || "");
  }

  let isPathLeadingToCollection: boolean | undefined = undefined;
  let property: Property | undefined;
  result.targetStructuredType = targetEntity;
  if (!targetEntity || segments.length === 0) {
    return result;
  }

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const isLastSegment = i === segments.length - 1;
    const navProperty = targetEntity.navigationProperties.find(
      (p) => p.name === segment
    );
    const isValidNavProperty =
      !!navProperty &&
      (!isPathLeadingToCollection || !navProperty.isCollection);
    if (isLastSegment) {
      property = targetEntity.entityProperties.find((p) => p.name === segment);
    }
    targetEntity = navProperty?.targetType;
    result.milestones.push(targetEntity?.fullyQualifiedName || "");
    isPathLeadingToCollection =
      isPathLeadingToCollection || !!navProperty?.isCollection;

    if (isValidNavProperty || property) {
      result.lastValidSegmentIndex++;
    }

    if (!targetEntity) {
      break;
    }
    if (!isValidNavProperty) {
      result.isCardinalityIssue = true;
      targetEntity = undefined;
      break;
    }
  }

  result.target = targetEntity || property;
  result.targetStructuredType = targetEntity;
  result.isCollection = isPathLeadingToCollection;
  return result;
}

export function getNextPossibleContextPathTargets(
  metadata: ConvertedMetadata,
  resolvedElement: EntitySet | EntityType | Singleton | EntityContainer,
  options: {
    isPropertyPath?: boolean;
    allowedTerms?: AnnotationTerm[];
    allowedTargets?: AllowedTargetType[];
    isCollection?: boolean;
  },
  milestones: string[]
): (EntitySet | Singleton | NavigationProperty)[] {
  return getNextPossiblePathTargets(
    metadata,
    resolvedElement,
    true,
    options,
    milestones
  ) as (EntitySet | Singleton | NavigationProperty)[];
}

export function getNextPossiblePathTargets(
  metadata: ConvertedMetadata,
  resolvedElement: EntitySet | EntityType | Singleton | EntityContainer,
  navigationSegmentsOnly: boolean,
  options: {
    isPropertyPath?: boolean;
    allowedTerms?: AnnotationTerm[];
    allowedTargets?: AllowedTargetType[];
    isCollection?: boolean;
  },
  milestones: string[]
): (EntitySet | Singleton | NavigationProperty | Property)[] {
  const result: (NavigationProperty | Property)[] = [];

  const isTargetHasAnnotations = (target: EntityType) => {
    if (!options.allowedTerms || options.allowedTerms.length === 0) {
      return true; // empty allowed terms considered as allowing any target
    }
    const annotationList = collectAnnotationsForElement(
      options.allowedTerms,
      target
    );
    return annotationList.length > 0;
  };

  const getNextPossibleTargetsForContainerChild = (
    child: EntitySet | Singleton
  ) => {
    const nextSegments = getNextPossiblePathTargets(
      metadata,
      child,
      navigationSegmentsOnly,
      options,
      milestones
    );
    nextSegments.push(
      ...getNextPossiblePathTargets(
        metadata,
        child.entityType,
        navigationSegmentsOnly,
        options,
        milestones
      )
    );
    return nextSegments;
  };

  const isEntitySetsAllowed = (options.allowedTargets || []).includes(
    "EntitySet"
  );
  const isSingletonsAllowed = (options.allowedTargets || []).includes(
    "Singleton"
  );
  if (resolvedElement._type === "EntityContainer") {
    return [
      ...(isEntitySetsAllowed
        ? metadata.entitySets.filter(
            (item) => getNextPossibleTargetsForContainerChild(item).length > 0
          )
        : []),
      ...(isSingletonsAllowed
        ? metadata.singletons.filter(
            (item) => getNextPossibleTargetsForContainerChild(item).length > 0
          )
        : []),
    ];
  }

  const resolvedEntityType = getEntityTypeForElement(resolvedElement);

  const navProps = resolvedEntityType.navigationProperties.filter(
    (navProperty) => {
      if (
        milestones.includes(navProperty.targetTypeName) ||
        navProperty.name === "SiblingEntity"
      ) {
        return false; // cyclic navigation
      }
      if (
        typeof options.isCollection === "boolean" &&
        !options.isCollection &&
        navProperty.isCollection
      ) {
        // cardinality should match when is required
        // exclusion: 1:1 segments are allowed after 1:many
        return false;
      }

      const furtherPathResult = getNextPossiblePathTargets(
        metadata,
        navProperty.targetType,
        navigationSegmentsOnly,
        {
          ...options,
          isCollection: navProperty.isCollection ? false : options.isCollection,
        },
        [...milestones, navProperty.targetTypeName]
      );
      return (
        (options.isPropertyPath &&
          navProperty.targetType.entityProperties.length) ||
        isTargetHasAnnotations(navProperty.targetType) ||
        furtherPathResult.length > 0
      );
    }
  );

  result.push(...navProps);

  // entity direct properties
  if (options.isPropertyPath && !navigationSegmentsOnly) {
    result.push(...resolvedEntityType.entityProperties);
  }

  return result;
}
