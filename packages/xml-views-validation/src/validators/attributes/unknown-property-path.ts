import { XMLAttribute } from "@xml-tools/ast";
import {
  AppContext,
  ServiceDetails,
} from "@ui5-language-assistant/semantic-model-types";
import {
  getAllowedAnnotationsTermsForControl,
  getElementAttributeValue,
  getUI5PropertyByXMLAttributeKey,
} from "@ui5-language-assistant/logic-utils";
import { AnnotationIssue } from "../../../api";
import { isPossibleBindingAttributeValue } from "../../utils/is-binding-attribute-value";
import { EntityType, Property } from "@sap-ux/vocabularies-types";
import { AnnotationTerm } from "@ui5-language-assistant/logic-utils/src/api";
import {
  collectAnnotationsForType,
  getNavigationTargets,
  isPropertyPathAllowed,
} from "@ui5-language-assistant/xml-views-completion";

export function validateUnknownPropertyPath(
  attribute: XMLAttribute,
  context: AppContext
): AnnotationIssue[] {
  const actualAttributeValue = attribute.value;
  const actualAttributeValueToken = attribute.syntax.value;
  if (
    actualAttributeValue === null ||
    actualAttributeValueToken === undefined ||
    isPossibleBindingAttributeValue(actualAttributeValue)
  ) {
    return [];
  }

  const ui5Property = getUI5PropertyByXMLAttributeKey(
    attribute,
    context.ui5Model
  );
  if (
    ui5Property?.library === "sap.fe.macros" &&
    ui5Property.name === "metaPath"
  ) {
    const element = attribute.parent;
    const control = element.name ?? "";

    const mainServicePath = context.manifest?.mainServicePath;
    const service = mainServicePath
      ? context.services[mainServicePath]
      : undefined;
    if (!service) {
      return [];
    }

    let baseType: EntityType | undefined;
    let contextPath = getElementAttributeValue(element, "contextPath");
    const entitySet =
      (context.manifest?.customViews || {})[context.customViewId || ""]
        ?.entitySet ?? "";

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
    const allowedTerms = getAllowedAnnotationsTermsForControl(control);

    let targetList: string[];
    if (baseType && isPropertyPathAllowed(control)) {
      // direct props and ones reachable via navigation
      if (isNavSegmentsAllowed) {
        targetList = getNavigationTargets(service, {
          allowedTerms: [],
          includeProperties: true,
          isPropertyPath: true,
          relativeFor: baseType,
        });
      } else {
        // direct props
        targetList = baseType.entityProperties.map((prop) => prop.name);
      }
    } else {
      return [];
    }

    if (targetList.includes(attribute.value || "")) {
      return [];
    }

    if (!attribute.value) {
      return [
        {
          kind: "PropertyPathRequired",
          message: "Property path is required",
          offsetRange: {
            start: actualAttributeValueToken.startOffset,
            end: actualAttributeValueToken.endOffset,
          },
          severity: "warn",
        },
      ];
    }

    // resolve by segments
    const segments = (attribute.value || "").split("/");
    const originalSegments = [...segments];
    if (segments.length > 1 && !isNavSegmentsAllowed) {
      return [
        {
          kind: "InvalidAnnotationTerm",
          message: `Navigation segments not allowed when contextPath is provided`,
          offsetRange: {
            start: actualAttributeValueToken.startOffset,
            end: actualAttributeValueToken.endOffset,
          },
          severity: "warn",
        } as AnnotationIssue,
      ];
    }

    let targetEntity: EntityType | undefined = baseType;
    let targetProperty: Property | undefined;
    let lastValidSegmentIndex = -1;
    let isAbsolutePath = false;
    if (segments.length > 1 && !segments[0]) {
      // absolute path
      segments.shift();
      targetEntity = service.convertedMetadata.entityTypes.find(
        (entityType) => entityType.name === segments[0]
      );
      lastValidSegmentIndex = targetEntity ? 1 : 0;
      isAbsolutePath = true;
      segments.shift();
      if (!segments.length) {
        return [
          targetEntity
            ? {
                kind: "UnknownPropertyPath",
                message: `Path should lead to property or navigation property: "${attribute.value}"`,
                offsetRange: {
                  start: actualAttributeValueToken.startOffset,
                  end: actualAttributeValueToken.endOffset,
                },
                severity: "warn",
              }
            : {
                kind: "PathDoesNotExist",
                message: `Path does not exist: "${attribute.value}"`,
                offsetRange: {
                  start: actualAttributeValueToken.startOffset,
                  end: actualAttributeValueToken.endOffset,
                },
                severity: "warn",
              },
        ];
      }
    }

    if (targetEntity) {
      for (const segment of segments) {
        if (!targetEntity) {
          break;
        }
        const navProperty = targetEntity.navigationProperties.find(
          (p) => p.name === segment
        );
        targetProperty = targetEntity.entityProperties.find(
          (p) => p.name === segment
        );
        targetEntity = navProperty?.targetType;
        if (targetEntity || targetProperty) {
          lastValidSegmentIndex++;
        }
      }
    }
    if (!targetEntity) {
      if (
        !targetProperty ||
        lastValidSegmentIndex < originalSegments.length - 1
      ) {
        originalSegments.splice(lastValidSegmentIndex + 1);
        const correctPart = originalSegments.join("/");
        return [
          {
            kind: "PathDoesNotExist",
            message: `Path does not exist: "${
              isAbsolutePath ? "" : contextPath + "/"
            }${attribute.value}"`,
            offsetRange: {
              start:
                actualAttributeValueToken.startOffset + correctPart.length + 1,
              end: actualAttributeValueToken.endOffset - 1,
            },
            severity: "warn",
          },
        ];
      }
    } else {
      // path exists
      return [];

      // TODO: distinguish not existing and not suitable term

      //      const isAnnotationExists = (annotationList || []).find(annotation => annotationToPath(annotation) === attribute.value);
      // const isAnnotationExists = false;

      // if (isAnnotationExists) {
      //   // Wrong term or no suitable annotations for control
      //   const issue = {
      //     kind: 'InvalidAnnotationTerm',
      //     message: `Invalid term: ${actualAttributeValueToken.image}`,
      //     offsetRange: {
      //       start: actualAttributeValueToken.startOffset,
      //       end: actualAttributeValueToken.endOffset,
      //     },
      //     severity: 'warn',
      //   } as AnnotationIssue;

      //   // if (filteredAnnotations.length) {
      //   //   const expectedTerms = filteredAnnotations.map(annotation => annotationToPath(annotation));
      //   //   issue.message = `${issue.message}. Expected: ${expectedTerms.join(',')}`;
      //   // } else {
      //   //   issue.message = `${issue.message}. There are no annotations in the project that are suitable for the current element`;
      //   // }

      //   return [issue];
      // }

      // return [
      //   {
      //     kind: 'PathDoesNotExist',
      //     message: `Path does not exist: "${contextPath}/${attribute.value}"`,
      //     offsetRange: {
      //       start: actualAttributeValueToken.startOffset,
      //       end: actualAttributeValueToken.endOffset,
      //     },
      //     severity: 'warn',
      //   },
      // ];
    }
  }

  return [];
}

function annotationToPath(annotation: {
  term: string;
  qualifier?: string;
}): string {
  const fullPath = annotation.qualifier
    ? `${annotation.term}#${annotation.qualifier}`
    : annotation.term;
  return `@${fullPath}`;
}

function collectAnnotationsForTarget(annotations: any[], contextPath: string) {
  const annotationsForTarget = annotations.filter((annotationList) => {
    const namespaceEndIndex = annotationList.target.indexOf(".");

    return (
      contextPath === `/${annotationList.target.slice(namespaceEndIndex + 1)}`
    );
  });
  return [].concat(
    ...annotationsForTarget.map((entry) => entry.annotations || [])
  );
}

function composeAnnotationPath(
  navPathSegments: string[],
  annotation: any
): string {
  const navPath = navPathSegments.join("/");
  return `${navPath.length ? navPath + "/" : ""}@${
    annotation.qualifier
      ? `${annotation.term}#${annotation.qualifier}`
      : annotation.term
  }`;
}

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
