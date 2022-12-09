import { XMLAttribute } from "@xml-tools/ast";
import { Context } from "@ui5-language-assistant/context";
import { getUI5PropertyByXMLAttributeKey } from "@ui5-language-assistant/logic-utils";
import { isPossibleBindingAttributeValue } from "@ui5-language-assistant/xml-views-validation";
import {
  AnnotationIssue,
  ANNOTATION_ISSUE_TYPE,
  SAP_FE_MACROS,
} from "../../../types";
import {
  getElementAttributeValue,
  isPropertyPathAllowed,
  resolvePathTarget,
} from "../../../utils";

import {
  EntityContainer,
  EntitySet,
  EntityType,
  Singleton,
  Property,
} from "@sap-ux/vocabularies-types";

export function validateUnknownPropertyPath(
  attribute: XMLAttribute,
  context: Context
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
    ui5Property?.library === SAP_FE_MACROS &&
    ui5Property.name === "metaPath"
  ) {
    const element = attribute.parent;
    const control = element.name;

    const mainServicePath = context.manifestDetails?.mainServicePath;
    const service = mainServicePath
      ? context.services[mainServicePath]
      : undefined;
    if (!service) {
      return [];
    }
    const metadata = service.convertedMetadata;
    let contextPath = getElementAttributeValue(element, "contextPath");
    const entitySet =
      (context.manifestDetails.customViews || {})[context.customViewId || ""]
        ?.entitySet ?? "";

    let isNavSegmentsAllowed = true;
    let base:
      | EntityContainer
      | EntitySet
      | EntityType
      | Singleton
      | Property
      | undefined;
    let baseType: EntityType | undefined;

    // resolve context
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
        return [];
      }
      contextPath = `/${entitySet}`;
      base = service.convertedMetadata.entitySets.find(
        (e) => e.name === entitySet
      );
      baseType = base?.entityType;
    }

    if (!baseType || !isPropertyPathAllowed(control)) {
      // the case is handled by annotation path validator
      return [];
    }

    if (!attribute.value && isPropertyPathAllowed(control)) {
      return [
        {
          kind: "PropertyPathRequired",
          issueType: ANNOTATION_ISSUE_TYPE,
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
    const segments = actualAttributeValue.split("/");
    const originalSegments = [...segments];
    if (segments.length > 1 && !isNavSegmentsAllowed) {
      return [
        {
          kind: "InvalidAnnotationTerm",
          issueType: ANNOTATION_ISSUE_TYPE,
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
                issueType: ANNOTATION_ISSUE_TYPE,
                message: `Path should lead to property: "${attribute.value}"`,
                offsetRange: {
                  start: actualAttributeValueToken.startOffset,
                  end: actualAttributeValueToken.endOffset,
                },
                severity: "warn",
              }
            : {
                kind: "PathDoesNotExist",
                issueType: ANNOTATION_ISSUE_TYPE,
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
            issueType: ANNOTATION_ISSUE_TYPE,
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
      // path is incomplete
      return [
        {
          kind: "UnknownPropertyPath",
          issueType: ANNOTATION_ISSUE_TYPE,
          message: `Path should lead to property: "${attribute.value}"`,
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
