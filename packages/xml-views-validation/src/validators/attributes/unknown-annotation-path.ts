import { XMLAttribute } from "@xml-tools/ast";
import { AppContext } from "@ui5-language-assistant/semantic-model-types";
import type {
  AnnotationTerm,
  ResolvedPathTargetType,
} from "@ui5-language-assistant/logic-utils";
import {
  collectAnnotationsForElement,
  fullyQualifiedNameToTerm,
  getAllowedAnnotationsTermsForControl,
  getElementAttributeValue,
  getUI5PropertyByXMLAttributeKey,
  isPropertyPathAllowed,
  resolvePathTarget,
} from "@ui5-language-assistant/logic-utils";
import { AnnotationIssue } from "../../../api";
import { isPossibleBindingAttributeValue } from "../../utils/is-binding-attribute-value";
import {
  EntityContainer,
  EntitySet,
  EntityType,
  Singleton,
  ConvertedMetadata,
} from "@sap-ux/vocabularies-types";

export function validateUnknownAnnotationPath(
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

    let annotationList: AnnotationLookupResultEntry[] | undefined;

    // const annotationListAssoc: { navSegment: string; annotations: any[] }[] = [];
    const mainServicePath = context.manifest?.mainServicePath;
    const service = mainServicePath
      ? context.services[mainServicePath]
      : undefined;
    if (!service) {
      return [];
    }
    const metadata = service.convertedMetadata;
    let contextPath = getElementAttributeValue(element, "contextPath");
    const entitySet =
      (context.manifest?.customViews || {})[context.customViewId || ""]
        ?.entitySet ?? "";

    let isNavSegmentsAllowed = true;
    let base: ResolvedPathTargetType | undefined;
    let baseType: EntityType | undefined;

    // resolve context and get annotations for it
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
      if (!entitySet) {
        return [
          {
            kind: "MissingEntitySet",
            message:
              "EntitySet for the current view is missing in application manifest. Attribute value completion and diagnostics are disabled",
            offsetRange: {
              start: actualAttributeValueToken.startOffset,
              end: actualAttributeValueToken.endOffset,
            },
            severity: "info",
          },
        ];
      }
      contextPath = `/${entitySet}`;
      base = service.convertedMetadata.entitySets.find(
        (e) => e.name === entitySet
      );
      baseType = base?.entityType;
    }
    const allowedTerms = getAllowedAnnotationsTermsForControl(control);

    if (!base || base._type === "Property") {
      return [];
    }

    if (!attribute.value) {
      return [
        {
          kind: "AnnotationPathRequired",
          message: "Annotation path is required",
          offsetRange: {
            start: actualAttributeValueToken.startOffset,
            end: actualAttributeValueToken.endOffset,
          },
          severity: "warn",
        },
      ];
    }
    if (!(attribute.value || "").includes("@")) {
      if (isPropertyPathAllowed(control)) {
        // The value seem to be a property path, another validator takes care
        return [];
      } else {
        return [
          {
            kind: "PropertyPathNotAllowed",
            message: `Property path not allowed. Use code completion to select annotation path`,
            offsetRange: {
              start: actualAttributeValueToken.startOffset,
              end: actualAttributeValueToken.endOffset,
            },
            severity: "warn",
          },
        ];
      }
    }

    // resolve by segments
    const segments = (attribute.value || "").split("/");
    const originalSegments = [...segments];
    const termSegmentIndex = segments.findIndex((segment) =>
      segment.includes("@")
    );
    segments.splice(termSegmentIndex);
    if (segments.length > 1 && !segments[0]) {
      // absolute path not allowed
      return [
        {
          kind: "InvalidAnnotationTerm",
          message: `Absolute annotation paths not allowed in metaPath. Use contextPath attribute to change path context`,
          offsetRange: {
            start: actualAttributeValueToken.startOffset,
            end: actualAttributeValueToken.endOffset,
          },
          severity: "warn",
        } as AnnotationIssue,
      ];
    } else if (segments.length > 0 && !isNavSegmentsAllowed) {
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
    let lastValidSegmentIndex = -1;
    if (targetEntity) {
      for (const segment of segments) {
        if (!targetEntity) {
          break;
        }
        const navProperty = targetEntity.navigationProperties.find(
          (p) => p.name === segment
        );
        targetEntity = navProperty?.targetType;
        if (targetEntity) {
          lastValidSegmentIndex++;
        }
      }
    }
    if (!targetEntity) {
      originalSegments.splice(lastValidSegmentIndex + 1);
      const correctPart = originalSegments.length
        ? originalSegments.join("/")
        : "";
      return [
        {
          kind: "PathDoesNotExist",
          message: `Path does not exist: "${contextPath}/${attribute.value}"`,
          offsetRange: {
            start:
              actualAttributeValueToken.startOffset + correctPart.length + 1,
            end: actualAttributeValueToken.endOffset - 1,
          },
          severity: "warn",
        },
      ];
    } else {
      const termSegment = originalSegments[termSegmentIndex];
      const parts = termSegment.split("@");
      let annos: any[] | undefined;
      annos = getAnnotationAppliedOnElement(
        metadata,
        allowedTerms,
        segments.length === 0 ? base : targetEntity,
        parts[0]
      );

      const match = annos.find(
        (anno) => composeAnnotationPath([], anno) === "@" + parts[1]
      );
      if (match) {
        return [];
      } else {
        // check whether the annotation exists on target
        const term: AnnotationTerm = fullyQualifiedNameToTerm(parts[1]);
        annos = getAnnotationAppliedOnElement(
          metadata,
          [term],
          segments.length === 0 ? base : targetEntity,
          parts[0]
        );
        const match = annos.find(
          (anno) => composeAnnotationPath([], anno) === "@" + parts[1]
        );
        if (match) {
          const messageAddOn = annotationList?.length
            ? `Trigger code completion to choose one of allowed annotations`
            : `There are no annotations in the project that are suitable for the current element`;

          return [
            {
              kind: "InvalidAnnotationTerm",
              message: `Invalid annotation term: "${attribute.value}". ${messageAddOn}`,
              offsetRange: {
                start: actualAttributeValueToken.startOffset,
                end: actualAttributeValueToken.endOffset,
              },
              severity: "warn",
            },
          ];
        }
      }

      return [
        {
          kind: "PathDoesNotExist",
          message: `Path does not exist: "${contextPath}/${attribute.value}"`,
          offsetRange: {
            start: actualAttributeValueToken.startOffset,
            end: actualAttributeValueToken.endOffset,
          },
          severity: "warn",
        },
      ];
    }
  }

  return [];
}

export function getAnnotationAppliedOnElement(
  metadata: ConvertedMetadata,
  allowedTerms: AnnotationTerm[],
  target: EntityContainer | EntitySet | EntityType | Singleton,
  navigationProperty?: string,
  property?: string
): any[] {
  if (target._type === "EntityContainer") {
    return [];
  }
  const result = collectAnnotationsForElement(
    metadata,
    allowedTerms,
    target,
    property,
    navigationProperty
  );
  if (["EntitySet", "Singleton"].includes(target._type || "")) {
    result.push(
      ...collectAnnotationsForElement(
        metadata,
        allowedTerms,
        (target as EntitySet | Singleton).entityType,
        property,
        navigationProperty
      )
    );
  }
  return result;
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
  metadata: ConvertedMetadata,
  allowedTerms: AnnotationTerm[],
  isCollectAssociations: boolean
): AnnotationLookupResultEntry[] {
  const result: AnnotationLookupResultEntry[] = [];
  const annotations = collectAnnotationsForElement(
    metadata,
    allowedTerms,
    baseEntity
  );
  if (annotations.length) {
    result.push({ path: [], annotations });
  }

  if (isCollectAssociations) {
    collectAnnotationsFromAssociations(
      baseEntity,
      metadata,
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
  metadata: ConvertedMetadata,
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
    const annotations = collectAnnotationsForElement(
      metadata,
      allowedTerms,
      property.targetType
    );
    if (annotations.length) {
      accumulator.push({ path: currentPath, annotations });
    }
    if (currentPath.length < 3) {
      collectAnnotationsFromAssociations(
        property.targetType,
        metadata,
        allowedTerms,
        milestones,
        currentPath,
        accumulator
      );
    }
  }
}
