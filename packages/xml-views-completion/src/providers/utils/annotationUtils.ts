import {
  ConvertedMetadata,
  EntityType,
  EntitySet,
  Singleton,
  NavigationProperty,
  Property,
} from "@sap-ux/vocabularies-types";
import { collectAnnotationsForElement } from "@ui5-language-assistant/logic-utils";
import { AnnotationTerm } from "@ui5-language-assistant/logic-utils/src/api";
import { ServiceDetails } from "@ui5-language-assistant/semantic-model-types";

// export function collectAnnotationsForType(convertedMetadata: ConvertedMetadata, entityType: string | EntityType, allowedTerms: AnnotationTerm[]): any[] {
//   const type = typeof entityType === 'string' ? convertedMetadata.entityTypes.find(entity => entity.fullyQualifiedName === entityType) : entityType;
//   const matchedAnnotations: any[] = [];
//   if (type) {
//     for (const term of allowedTerms) {
//       const annotations = type.annotations[term.alias] || {};
//       const paths = Object.keys(annotations);
//       for (const path of paths) {
//         const annotation = annotations[path];
//         if (annotation.term === term.fullyQualifiedName) {
//           matchedAnnotations.push(annotation);
//         }
//       }
//     }
//   }
//   return matchedAnnotations;
// }

// const getElementsByKind = (metadata: ConvertedMetadata, element: EntityType | EntitySet | Singleton) => {
//   switch (element._type) {
//     case 'EntitySet':
//       return metadata.entitySets;
//     case 'EntityType':
//       return metadata.entityTypes;
//     case 'Singleton':
//       return metadata.singletons;
//   }
// };

export function getNavigationTargets(
  service: ServiceDetails,
  options: {
    allowedTerms: AnnotationTerm[];
    isCollection?: boolean;
    isPropertyPath?: boolean;
    includeProperties?: boolean;
    relativeFor?: EntityType;
  }
): string[] {
  const toPath = (
    entity: EntityType,
    property1: NavigationProperty | Property,
    property2?: NavigationProperty | Property,
    property3?: Property
  ) => {
    const path: (string | undefined)[] = [
      property1.name,
      property2?.name,
      property3?.name,
    ].filter((item) => !!item);
    return (options.relativeFor ? "" : `/${entity.name}/`) + path.join("/");
  };

  const isTargetValid = (target: EntityType) => {
    if (!options.isPropertyPath) {
      const annotationList = collectAnnotationsForElement(
        service.convertedMetadata,
        options.allowedTerms,
        target
      );
      return annotationList.length > 0;
    } else {
      return true;
    }
  };

  const result: string[] = [];
  const entityTypeList = options.relativeFor
    ? [options.relativeFor]
    : service.convertedMetadata.entityTypes;
  entityTypeList.forEach((entity) => {
    // navigation properties
    const navProps = entity.navigationProperties.filter((navProperty) => {
      if (navProperty.targetType === entity) {
        return false; // navigation to entity itself
      }
      if (
        typeof options.isCollection === "boolean" &&
        navProperty.isCollection !== options.isCollection
      ) {
        return false;
      }
      const type = navProperty.targetType;

      return isTargetValid(type);
    });

    result.push(...navProps.map((prop) => toPath(entity, prop)));

    // native properties
    if (options.includeProperties) {
      result.push(
        ...entity.entityProperties.map((prop) => toPath(entity, prop))
      );
    }

    // second level associations
    entity.navigationProperties.forEach((navProperty1) => {
      if (navProperty1.targetType !== entity) {
        const type1 = navProperty1.targetType;
        const navProps = type1.navigationProperties.filter((navProperty2) => {
          if (
            navProperty2.targetType === type1 || // self-navigation
            navProperty2.targetType === entity || // cyclic navigation
            navProperty1.isCollection ||
            (typeof options.isCollection === "boolean" &&
              navProperty2.isCollection !== options.isCollection) // wrong cardinality
            // (navProperty1.isCollection && navProperty2.isCollection) || // multiple 1:many segments
            // (typeof isCollection === "boolean" &&
            //   (navProperty1.isCollection || navProperty2.isCollection) !==
            //     isCollection) // wrong cardinality
          ) {
            return false;
          }
          const type2 = navProperty2.targetType;
          if (!navProperty2.isCollection && options.includeProperties) {
            result.push(
              ...type2.entityProperties.map((prop) =>
                toPath(entity, navProperty1, navProperty2, prop)
              )
            );
          }
          return isTargetValid(type2);
        });
        result.push(
          ...navProps.map((prop) => toPath(entity, navProperty1, prop))
        );
        if (!navProperty1.isCollection && options.includeProperties) {
          result.push(
            ...type1.entityProperties.map((prop) =>
              toPath(entity, navProperty1, prop)
            )
          );
        }
      }
    });
  });

  return result;
}

// export function resolvePathTarget(
//   metadata: ConvertedMetadata,
//   path: string,
//   baseEntity?: EntityType
// ): {
//   target: EntityType | EntitySet | Singleton | Property | undefined;
//   lastValidSegmentIndex: number;
//   isCollection: boolean;
// } {
//   const result: {
//     target: EntityType | EntitySet | Singleton | Property | undefined;
//     lastValidSegmentIndex: number;
//     isCollection: boolean;
//   } = { target: undefined, lastValidSegmentIndex: -1, isCollection: false };

//   let targetElement: EntityType | EntitySet | Singleton | Property | undefined;
//   let targetEntity: EntityType | undefined;
//   const segments = path.split('/');
//   const isAbsolutePath = path.startsWith('/');
//   if (isAbsolutePath) {
//     segments.shift();
//     const segment = segments.shift();
//     targetElement = [...metadata.entityTypes, ...metadata.entitySets, ...metadata.singletons].find(entry => entry.name === segment);
//     if (!targetElement) {
//       return result;
//     } else {
//       result.target = targetElement;
//       result.lastValidSegmentIndex = 1;
//       targetEntity = getEntityTypeForElement(targetElement);
//     }
//   } else {
//     targetEntity = baseEntity;
//   }

//   let isNextSegmentPossible = true;
//   let isPathLeadingToCollection = false;
//   let isPathFound = !!targetEntity;
//   let property: Property | undefined;

//   for (let i = 0; i < segments.length; i++) {
//     const segment = segments[i];
//     const isLastSegment = i === segments.length - 1;

//     if (!targetEntity) {
//       break;
//     }
//     if (!isNextSegmentPossible) {
//       targetEntity = undefined;
//       break;
//     }

//     const navProperty = targetEntity.navigationProperties.find(p => p.name === segment);
//     if (isLastSegment) {
//       property = targetEntity.entityProperties.find(p => p.name === segment);
//     }
//     targetEntity = navProperty?.targetType;
//     isPathFound = !!targetEntity || !!property;
//     isPathLeadingToCollection = isPathLeadingToCollection || !!navProperty?.isCollection;
//     isNextSegmentPossible = isPathFound && !isPathLeadingToCollection && !!navProperty;

//     if (isPathFound) {
//       result.lastValidSegmentIndex++;
//     }
//   }

//   result.target = targetEntity || property;
//   result.isCollection = isPathLeadingToCollection;
//   return result;
// }

// export function getNextPossiblePathTargets(
//   metadata: ConvertedMetadata,
//   resolvedElement: EntitySet | EntityType | Singleton,
//   options: {
//     allowedTerms: AnnotationTerm[];
//     isCollection?: boolean;
//     isPropertyPath?: boolean;
//     includeProperties?: boolean;
//   },
//   milestones: string[]
// ): (NavigationProperty | Property)[] {
//   const result: (NavigationProperty | Property)[] = [];

//   const isTargetHasAnnotations = (target: EntityType) => {
//     const annotationList = collectAnnotationsForElement(metadata, options.allowedTerms, target);
//     return annotationList.length > 0;
//   };

//   const resolvedEntityType = getEntityTypeForElement(resolvedElement);
//   if (!resolvedEntityType) {
//     return [];
//   }

//   // // navigation properties
//   // const navProps = resolvedEntityType.navigationProperties.filter(navProperty => {
//   //   if (navProperty.targetType === resolvedEntityType) {
//   //     return false; // navigation to entity itself
//   //   }
//   //   if (typeof options.isCollection === 'boolean' && navProperty.isCollection !== options.isCollection) {
//   //     return false;
//   //   }
//   //   return options.isPropertyPath || isTargetHasAnnotations(navProperty.targetType);
//   // });

//   const navProps = resolvedEntityType.navigationProperties.filter(navProperty => {
//     if (milestones.includes(navProperty.targetTypeName)) {
//       return false; // cyclic navigation
//     }
//     if (typeof options.isCollection === 'boolean' && navProperty.isCollection !== options.isCollection) {
//       return false;
//     }

//     const currentSubPathResult = getNextPossiblePathTargets(metadata, navProperty.targetType, { ...options, isCollection: navProperty.isCollection ? true : options.isCollection }, [
//       ...milestones,
//       navProperty.targetTypeName,
//     ]);
//     return options.isPropertyPath || isTargetHasAnnotations(navProperty.targetType) || currentSubPathResult.length > 0;
//   });

//   result.push(...navProps);

//   // entity direct properties
//   if (options.includeProperties) {
//     result.push(...resolvedEntityType.entityProperties);
//   }

//   return result;
// }

// // TODO: move it to some central place
// export enum AllowedElementType {
//   EntitySet = 'EntitySet',
//   EntityType = 'EntityType',
//   Singleton = 'Singleton',
//   NavigationProperty = 'NavigationProperty',
//   Property = 'Property',
// }

// export function getEntityTypeForElement(element: EntitySet | EntityType | Singleton): EntityType | undefined {
//   return element._type === 'EntityType' ? element : element.entityType;
// }

// export function getRootElements(metadata: ConvertedMetadata, allowedTerms: AnnotationTerm[], allowedElementTypes: AllowedElementType[]): (EntitySet | EntityType | Singleton)[] {
//   let result: (EntitySet | EntityType | Singleton)[] = [];
//   result.push(...(allowedElementTypes.includes(AllowedElementType.EntitySet) ? metadata.entitySets : []));
//   result.push(...(allowedElementTypes.includes(AllowedElementType.EntityType) ? metadata.entityTypes : []));
//   result.push(...(allowedElementTypes.includes(AllowedElementType.Singleton) ? metadata.singletons : []));
//   if (allowedTerms.length) {
//     result = result.filter(item => {
//       const entityType = getEntityTypeForElement(item);
//       if (!entityType) {
//         return false;
//       }
//       const annotationList = collectAnnotationsForElement(metadata, allowedTerms, entityType);
//       return annotationList.length > 0;
//     });
//   }
//   return result;
// }

// export function collectAnnotationsForElement(
//   metadata: ConvertedMetadata,
//   allowedTerms: AnnotationTerm[],
//   element: string | EntityType | EntitySet | Singleton,
//   property?: string,
//   navigationProperty?: string
// ): any[] {
//   const matchedAnnotations: any[] = [];

//   const actualElement: EntityType | EntitySet | Singleton | undefined =
//     typeof element === 'string' ? [...metadata.entityTypes, ...metadata.entitySets, ...metadata.singletons].find(entry => entry.fullyQualifiedName === element) : element;
//   if (!actualElement) {
//     return [];
//   }
//   const type: EntityType | undefined = getEntityTypeForElement(actualElement);
//   if (!type) {
//     return [];
//   }
//   let target: EntityType | EntitySet | Singleton | Property | NavigationProperty | undefined;
//   if (property) {
//     target = type.entityProperties.find(p => p.name === property);
//   } else if (navigationProperty) {
//     target = type.navigationProperties.find(p => p.name === property);
//   } else {
//     target = actualElement;
//   }
//   if (!target) {
//     return [];
//   }

//   for (const term of allowedTerms) {
//     const annotations = target.annotations[term.alias] || {};
//     const paths = Object.keys(annotations);
//     for (const path of paths) {
//       const annotation = annotations[path];
//       if (annotation.term === term.fullyQualifiedName) {
//         matchedAnnotations.push(annotation);
//       }
//     }
//   }
//   return matchedAnnotations;
// }
