import {
  collectAnnotationsForElement,
  getAllowedAnnotationsTermsForControl,
  getElementAttributeValue,
  getNextPossiblePathTargets,
  getUI5PropertyByXMLAttributeKey,
  isPropertyPathAllowed,
  resolvePathTarget,
} from "@ui5-language-assistant/logic-utils";
import {
  AnnotationPathInXMLAttributeValueCompletion,
  PropertyPathInXMLAttributeValueCompletion,
} from "../../../api";
import { allowedTargets, UI5AttributeValueCompletionOptions } from "./index";
import {
  EntityContainer,
  EntitySet,
  Singleton,
  EntityType,
  NavigationProperty,
  Property,
} from "@sap-ux/vocabularies-types";

export interface CompletionItem {
  name: string;
  text: string;
  commitCharacters: string[];
  commitCharacterRequired: boolean;
  // documentation: { kind: MarkupKind.Markdown, value: documentation.join('\n') }
}

/**
 * Suggests values for macros metaPath
 */
export function metaPathSuggestions({
  element,
  attribute,
  context,
  prefix,
}: UI5AttributeValueCompletionOptions): (
  | AnnotationPathInXMLAttributeValueCompletion
  | PropertyPathInXMLAttributeValueCompletion
)[] {
  const result: (
    | AnnotationPathInXMLAttributeValueCompletion
    | PropertyPathInXMLAttributeValueCompletion
  )[] = [];
  const ui5Property = getUI5PropertyByXMLAttributeKey(
    attribute,
    context.ui5Model
  );

  if (
    !(
      ui5Property?.library === "sap.fe.macros" &&
      ui5Property.name === "metaPath"
    )
  ) {
    return [];
  }
  // let annotationList: AnnotationLookupResultEntry[] | undefined;
  let contextPath = getElementAttributeValue(element, "contextPath");
  const control = element.name ?? "";
  const mainServicePath = context.manifest?.mainServicePath;
  const service = mainServicePath
    ? context.services[mainServicePath]
    : undefined;
  if (!service) {
    return [];
  }
  const entitySet =
    (context.manifest?.customViews || {})[context.customViewId || ""]
      ?.entitySet ?? "";
  const metadata = service.convertedMetadata;
  let baseType: EntityType | undefined;
  let base:
    | EntityContainer
    | EntitySet
    | EntityType
    | Singleton
    | Property
    | undefined;
  let isNavSegmentsAllowed = true;

  if (typeof contextPath === "string") {
    if (!contextPath.startsWith("/")) {
      return [];
    }
    ({ target: base, targetStructuredType: baseType } = resolvePathTarget(
      metadata,
      contextPath
    ));
    isNavSegmentsAllowed = false;
  } else {
    contextPath = `/${entitySet}`;
    base = service.convertedMetadata.entitySets.find(
      (e) => e.name === entitySet
    );
    baseType = base?.entityType;
  }

  const isPropertiesAllowed = isPropertyPathAllowed(control);

  if (baseType) {
    const allowedTerms = getAllowedAnnotationsTermsForControl(control);

    const segments = (attribute.value || "").split("/");
    const precedingSegments = (prefix || "").split("/");
    const completionSegmentIndex = precedingSegments.length - 1;
    precedingSegments.pop();
    const completionSegmentOffset =
      precedingSegments.join("/").length + (precedingSegments.length ? 1 : 0);
    const isAbsolutePath = segments.length && !segments[0];

    if (isAbsolutePath && completionSegmentIndex > 0) {
      // absolute paths are not supported in metaPath
      return [];
    }
    if (!isNavSegmentsAllowed && completionSegmentIndex > 0) {
      return [];
    }

    // completion for (navigation) property segment or annotation term
    const precedingPath = segments.slice(0, completionSegmentIndex).join("/");
    const { target, isCollection, targetStructuredType } =
      completionSegmentIndex === 0
        ? {
            target: base,
            targetStructuredType: baseType,
            isCollection: undefined,
          }
        : resolvePathTarget(service.convertedMetadata, precedingPath, baseType);
    if (!target) {
      // target not resolved - no further segments possible
      return [];
    } else if (isPropertiesAllowed && target._type === "Property") {
      // no further segments possible after entity property
      return [];
    } else {
      // Calculate completion range considering that value region includes quotes
      const completionSegmentStart =
        (attribute.syntax.value?.startColumn ?? 0) +
        1 +
        completionSegmentOffset;
      const completionSegmentEnd = (attribute.syntax.value?.endColumn ?? 2) - 1;
      const astNode = {
        ...attribute,
        syntax: {
          ...attribute.syntax,
          value: {
            ...attribute.syntax.value,
            startColumn: completionSegmentStart,
            endColumn: completionSegmentEnd,
          },
        },
      };

      let possibleTargets: (
        | EntitySet
        | Singleton
        | NavigationProperty
        | Property
      )[] = [];
      if (target._type === "Property" || target._type === "EntityContainer") {
        return [];
      }
      // collect existing terms
      const annotationList = collectAnnotationsForElement(
        service.convertedMetadata,
        allowedTerms,
        target
      );
      if (["EntitySet", "Singleton"].includes(target._type)) {
        // for first path segment completion, where current base can be entity set or singleton,
        // we collect also terms applied on their structural entity type
        annotationList.push(
          ...collectAnnotationsForElement(
            service.convertedMetadata,
            allowedTerms,
            targetStructuredType || ""
          )
        );
      }
      result.push(
        ...annotationList.map((annotation) => {
          const fullPath = `@${
            annotation.qualifier
              ? `${annotation.term}#${annotation.qualifier}`
              : annotation.term
          }`;
          return {
            type: "AnnotationPathInXMLAttributeValue",
            astNode,
            ui5Node: {
              kind: "AnnotationPath",
              name: fullPath,
              value: fullPath,
            },
          } as AnnotationPathInXMLAttributeValueCompletion;
        })
      );

      // collect possible properties or navigation segments
      possibleTargets = getNextPossiblePathTargets(
        service.convertedMetadata,
        target,
        false,
        {
          allowedTerms,
          allowedTargets,
          isPropertyPath: isPropertiesAllowed,
          isCollection: isCollection ? false : undefined,
        },
        [target.fullyQualifiedName]
      );

      result.push(
        ...possibleTargets
          .filter(
            (t) => isNavSegmentsAllowed || t._type !== "NavigationProperty"
          )
          .map((t) => {
            return {
              type: "AnnotationPathInXMLAttributeValue",
              astNode,
              ui5Node: {
                kind: "AnnotationPath",
                name: t.name,
                value: t.name,
              },
            } as AnnotationPathInXMLAttributeValueCompletion;
          })
      );
    }
  }
  return result;
}

// annotationList = collectAnnotations(baseType, service, allowedTerms, isNavSegmentsAllowed);
// annotations applied on base
// annotationList = collectAnnotationsForType(service.convertedMetadata, baseType, allowedTerms);

// // annotations applied on associations
// const base = service.convertedMetadata.entityTypes.find(t => t.fullyQualifiedName === baseType);
// (base?.navigationProperties || [])
//   .filter(np => np.targetType !== base)
//   .forEach(np => {
//     const annotations = collectAnnotationsForType(service.convertedMetadata, np.targetType, allowedTerms);
//     if (annotations.length) {
//       annotationListAssoc.push({ navSegment: np.name, annotations });
//     }
//   });

// TODO: truncate terms
// Annotation terms
// if (annotationList?.length) {
//   annotationList.forEach(entry => {
//     const navPath = entry.path.join('/');
//     result.push(
//       ...entry.annotations.map(annotation => {
//         const fullPath = `${navPath.length ? navPath + '/' : ''}@${annotation.qualifier ? `${annotation.term}#${annotation.qualifier}` : annotation.term}`;
//         return {
//           type: 'AnnotationPathInXMLAttributeValue',
//           astNode: attribute,
//           ui5Node: {
//             kind: 'AnnotationPath',
//             name: fullPath,
//             value: fullPath,
//           },
//         } as AnnotationPathInXMLAttributeValueCompletion;
//       })
//     );
//   });
// }

// annotationListAssoc.forEach(entry => {
//   result.push(
//     ...entry.annotations.map(annotation => {
//       const fullPath = `${entry.navSegment}/@${annotation.qualifier ? `${annotation.term}#${annotation.qualifier}` : annotation.term}`;
//       return {
//         type: 'AnnotationPathInXMLAttributeValue',
//         astNode: attribute,
//         ui5Node: {
//           kind: 'AnnotationPath',
//           name: fullPath,
//           value: fullPath,
//         },
//       } as AnnotationPathInXMLAttributeValueCompletion;
//     })
//   );
// });

// Property paths
// if (baseType && isPropertyPathAllowed(control)) {
//   // direct props and ones reachable via navigation
//   if (isNavSegmentsAllowed) {
//     const targetList = [
//       ...getNavigationTargets(service, {
//         allowedTerms: [],
//         includeProperties: true,
//         isPropertyPath: true,
//         relativeFor: baseType,
//       }),
//     ];
//     result.push(
//       ...targetList.map(fullPath => {
//         return {
//           type: 'PropertyPathInXMLAttributeValue',
//           astNode: attribute,
//           ui5Node: {
//             kind: 'AnnotationPath',
//             name: fullPath,
//             value: fullPath,
//           },
//         } as PropertyPathInXMLAttributeValueCompletion;
//       })
//     );
//   } else {
//     // direct props
//     result.push(
//       ...baseType.entityProperties.map(prop => {
//         return {
//           type: 'PropertyPathInXMLAttributeValue',
//           astNode: attribute,
//           ui5Node: {
//             kind: 'AnnotationPath',
//             name: prop.name,
//             value: prop.name,
//           },
//         } as PropertyPathInXMLAttributeValueCompletion;
//       })
//     );
//   }

//   result.push(
//     ...getPropertyPathsForCompletion(service, contextPath, startString).map(
//       (property) =>
//         ({
//           type: "PropertyPathInXMLAttributeValue",
//           astNode: attribute,
//           ui5Node: {
//             kind: "PropertyPath",
//             name: property.name,
//             value: property.text,
//           },
//           details: {
//             startString,
//             remainingString:
//               attribute.value?.slice(startString.length) || "",
//             commitCharacters: property.commitCharacterRequired
//               ? property.commitCharacters
//               : [],
//           },
//         } as PropertyPathInXMLAttributeValueCompletion)
//     )
//   );

// function resolveContextPath(convertedMetadata: ConvertedMetadata, contextPath: string): string | undefined {
//   if (!contextPath.startsWith('/')) {
//     // relative paths not supported;
//     return undefined;
//   }
//   const segments = contextPath.split('/');
//   const firstSegment = segments[0];
//   if (!firstSegment) {
//     return undefined
//   }
//   const entitySet = convertedMetadata.entitySets.
// }

// function collectPaths()

// interface AnnotationLookupResultEntry {
//   path: string[];
//   annotations: any[];
// }
// function collectAnnotations(
//   baseEntity: EntityType,
//   service: ServiceDetails,
//   allowedTerms: AnnotationTerm[],
//   isCollectAssociations: boolean
// ): AnnotationLookupResultEntry[] {
//   const result: AnnotationLookupResultEntry[] = [];
//   const annotations = collectAnnotationsForElement(
//     service.convertedMetadata,
//     allowedTerms,
//     baseEntity
//   );
//   if (annotations.length) {
//     result.push({ path: [], annotations });
//   }

//   if (isCollectAssociations) {
//     collectAnnotationsFromAssociations(
//       baseEntity,
//       service,
//       allowedTerms,
//       new Set([baseEntity.fullyQualifiedName]),
//       [],
//       result
//     );
//   }
//   return result;
// }

// function collectAnnotationsFromAssociations(
//   entityType: EntityType,
//   service: ServiceDetails,
//   allowedTerms: AnnotationTerm[],
//   milestones: Set<string>,
//   path: string[],
//   accumulator: AnnotationLookupResultEntry[]
// ): void {
//   for (const property of entityType.navigationProperties) {
//     if (milestones.has(property.targetTypeName)) {
//       continue;
//     }
//     milestones.add(property.targetTypeName);
//     const currentPath = [...path, property.name];
//     const annotations = collectAnnotationsForElement(
//       service.convertedMetadata,
//       allowedTerms,
//       property.targetType
//     );
//     if (annotations.length) {
//       accumulator.push({ path: currentPath, annotations });
//     }
//     if (currentPath.length < 3) {
//       collectAnnotationsFromAssociations(
//         property.targetType,
//         service,
//         allowedTerms,
//         milestones,
//         currentPath,
//         accumulator
//       );
//     }
//   }
// }
