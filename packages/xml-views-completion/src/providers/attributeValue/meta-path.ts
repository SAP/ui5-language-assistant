import {
  getAllowedAnnotationsTermsForControl,
  getElementAttributeValue,
  getUI5PropertyByXMLAttributeKey,
} from "@ui5-language-assistant/logic-utils";
import {
  AnnotationPathInXMLAttributeValueCompletion,
  PropertyPathInXMLAttributeValueCompletion,
} from "../../../api";
import { UI5AttributeValueCompletionOptions } from "./index";
import { EntityType } from "@sap-ux/vocabularies-types";
import { AnnotationTerm } from "@ui5-language-assistant/logic-utils/src/api";
import {
  collectAnnotationsForType,
  getNavigationTargets,
  isPropertyPathAllowed,
} from "../utils/annotationUtils";
import { ServiceDetails } from "@ui5-language-assistant/semantic-model-types";

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
    ui5Property?.library === "sap.fe.macros" &&
    ui5Property.name === "metaPath"
  ) {
    let annotationList: AnnotationLookupResultEntry[] | undefined;
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
        .entitySet ?? "";
    let baseType: EntityType | undefined;
    let isNavSegmentsAllowed = true;
    if (typeof contextPath === "string") {
      //resolve context and get annotations for it
      if (!contextPath.startsWith("/")) {
        return [];
      }
      const segments = contextPath.split("/");
      segments.shift();
      let targetEntity = service.convertedMetadata.entityTypes.find(
        (entityType) => entityType.name === segments[0]
      );
      segments.shift();
      for (const segment of segments) {
        if (!targetEntity) {
          break;
        }
        const navProperty = targetEntity.navigationProperties.find(
          (p) => p.name === segment
        );
        targetEntity = navProperty?.targetType;
      }
      baseType = targetEntity;
      isNavSegmentsAllowed = false;
    } else {
      contextPath = `/${entitySet}`;
      baseType = service.convertedMetadata.entitySets.find(
        (e) => e.name === entitySet
      )?.entityType;
    }

    if (baseType) {
      const allowedTerms = getAllowedAnnotationsTermsForControl(control);
      annotationList = collectAnnotations(
        baseType,
        service,
        allowedTerms,
        isNavSegmentsAllowed
      );
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
    }

    // TODO: truncate terms
    // Annotation terms
    if (annotationList?.length) {
      annotationList.forEach((entry) => {
        const navPath = entry.path.join("/");
        result.push(
          ...entry.annotations.map((annotation) => {
            const fullPath = `${navPath.length ? navPath + "/" : ""}@${
              annotation.qualifier
                ? `${annotation.term}#${annotation.qualifier}`
                : annotation.term
            }`;
            return {
              type: "AnnotationPathInXMLAttributeValue",
              astNode: attribute,
              ui5Node: {
                kind: "AnnotationPath",
                name: fullPath,
                value: fullPath,
              },
            } as AnnotationPathInXMLAttributeValueCompletion;
          })
        );
      });
    }
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
    if (baseType && isPropertyPathAllowed(control)) {
      // direct props and ones reachable via navigation
      if (isNavSegmentsAllowed) {
        const targetList = [
          ...getNavigationTargets(service, {
            allowedTerms: [],
            includeProperties: true,
            isPropertyPath: true,
            relativeFor: baseType,
          }),
        ];
        result.push(
          ...targetList.map((fullPath) => {
            return {
              type: "PropertyPathInXMLAttributeValue",
              astNode: attribute,
              ui5Node: {
                kind: "AnnotationPath",
                name: fullPath,
                value: fullPath,
              },
            } as PropertyPathInXMLAttributeValueCompletion;
          })
        );
      } else {
        // direct props
        result.push(
          ...baseType.entityProperties.map((prop) => {
            return {
              type: "PropertyPathInXMLAttributeValue",
              astNode: attribute,
              ui5Node: {
                kind: "AnnotationPath",
                name: prop.name,
                value: prop.name,
              },
            } as PropertyPathInXMLAttributeValueCompletion;
          })
        );
      }
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
    }

    return result;
  }

  return [];
}

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

interface AnnotationLookupResultEntry {
  path: string[];
  annotations: any[];
}
function collectAnnotations(
  baseEntity: EntityType,
  service: ServiceDetails,
  allowedTerms: AnnotationTerm[],
  isCollectAssociations: boolean
): AnnotationLookupResultEntry[] {
  const result: AnnotationLookupResultEntry[] = [];
  const annotations = collectAnnotationsForType(
    service.convertedMetadata,
    baseEntity,
    allowedTerms
  );
  if (annotations.length) {
    result.push({ path: [], annotations });
  }

  if (isCollectAssociations) {
    collectAnnotationsFromAssociations(
      baseEntity,
      service,
      allowedTerms,
      new Set([baseEntity.fullyQualifiedName]),
      [],
      result
    );
  }
  return result;
}

function collectAnnotationsFromAssociations(
  entityType: EntityType,
  service: ServiceDetails,
  allowedTerms: AnnotationTerm[],
  milestones: Set<string>,
  path: string[],
  accumulator: AnnotationLookupResultEntry[]
): void {
  for (const property of entityType.navigationProperties) {
    if (milestones.has(property.targetTypeName)) {
      continue;
    }
    milestones.add(property.targetTypeName);
    const currentPath = [...path, property.name];
    const annotations = collectAnnotationsForType(
      service.convertedMetadata,
      property.targetType,
      allowedTerms
    );
    if (annotations.length) {
      accumulator.push({ path: currentPath, annotations });
    }
    if (currentPath.length < 3) {
      collectAnnotationsFromAssociations(
        property.targetType,
        service,
        allowedTerms,
        milestones,
        currentPath,
        accumulator
      );
    }
  }
}
