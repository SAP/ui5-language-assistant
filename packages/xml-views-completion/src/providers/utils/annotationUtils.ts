import {
  ConvertedMetadata,
  EntityType,
  NavigationProperty,
  Property,
} from "@sap-ux/vocabularies-types";
import { AnnotationTerm } from "@ui5-language-assistant/logic-utils/src/api";
import { ServiceDetails } from "@ui5-language-assistant/semantic-model-types";

export function isPropertyPathAllowed(control: string): boolean {
  return control === "Field";
}

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

export function collectAnnotationsForType(
  convertedMetadata: ConvertedMetadata,
  entityType: string | EntityType,
  allowedTerms: AnnotationTerm[],
  property?: string,
  navigationProperty?: string
): any[] {
  const type =
    typeof entityType === "string"
      ? convertedMetadata.entityTypes.find(
          (entity) => entity.fullyQualifiedName === entityType
        )
      : entityType;
  const matchedAnnotations: any[] = [];
  if (type) {
    let target: EntityType | Property | NavigationProperty | undefined;
    if (property) {
      target = type.entityProperties.find((p) => p.name === property);
    } else if (navigationProperty) {
      target = type.navigationProperties.find((p) => p.name === property);
    } else {
      target = type;
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
  }
  return matchedAnnotations;
}

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
      const annotationList = collectAnnotationsForType(
        service.convertedMetadata,
        target,
        options.allowedTerms
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
