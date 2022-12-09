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
  getPathConstraintsForControl,
  isPropertyPathAllowed,
  resolvePathTarget,
  getAnnotationAppliedOnElement,
} from "../../../utils";
import {
  EntityContainer,
  EntitySet,
  EntityType,
  Singleton,
} from "@sap-ux/vocabularies-types";

export function validateUnknownAnnotationTarget(
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
    ui5Property.name === "contextPath"
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

    const { expectedAnnotations, expectedTypes } = getPathConstraintsForControl(
      control,
      ui5Property
    );
    if (expectedAnnotations.length + expectedTypes.length === 0) {
      return [
        {
          kind: "ContextPathBindingNotRecommended",
          issueType: ANNOTATION_ISSUE_TYPE,
          message: `contextPath for ${control} is usually defined if binding for the object is different than that of the page`,
          offsetRange: {
            start: actualAttributeValueToken.startOffset,
            end: actualAttributeValueToken.endOffset,
          },
          severity: "info",
        },
      ];
    }

    // Target is mandatory
    if (!attribute.value) {
      return [
        {
          kind: "AnnotationTargetRequired",
          issueType: ANNOTATION_ISSUE_TYPE,
          message: "Annotation target is required",
          offsetRange: {
            start: actualAttributeValueToken.startOffset,
            end: actualAttributeValueToken.endOffset,
          },
          severity: "warn",
        },
      ];
    }

    if (!actualAttributeValue.startsWith("/")) {
      return [
        {
          kind: "UnknownEnumValue",
          issueType: ANNOTATION_ISSUE_TYPE,
          message: `Unknown annotation target: ${actualAttributeValueToken.image}. Absolute path is expected`,
          offsetRange: {
            start: actualAttributeValueToken.startOffset,
            end: actualAttributeValueToken.endOffset,
          },
          severity: "warn",
        },
      ];
    }

    // Check by segments
    const {
      target,
      targetStructuredType: targetEntity,
      isCardinalityIssue,
      lastValidSegmentIndex,
      isCollection,
    } = resolvePathTarget(service.convertedMetadata, actualAttributeValue);
    const originalSegments = actualAttributeValue.split("/");

    if (target?._type === "Property") {
      return [
        {
          kind: "UnknownEnumValue",
          issueType: ANNOTATION_ISSUE_TYPE,
          message: `Wrong path. It is pointing to entity property but should lead to entity type or entity set`,
          offsetRange: {
            start: actualAttributeValueToken.startOffset,
            end: actualAttributeValueToken.endOffset,
          },
          severity: "warn",
        },
      ];
    }

    if (target?._type === "EntityContainer") {
      return [
        {
          kind: "IncompletePath",
          issueType: ANNOTATION_ISSUE_TYPE,
          message: `Path is incomplete. Trigger code completion to choose next available path segment`,
          offsetRange: {
            start: actualAttributeValueToken.startOffset,
            end: actualAttributeValueToken.endOffset,
          },
          severity: "warn",
        },
      ];
    }

    if (!target || !targetEntity) {
      if (!isCardinalityIssue) {
        // Path does not exist
        originalSegments.splice(lastValidSegmentIndex + 1);
        const correctPart = originalSegments.length
          ? "/" + originalSegments.join("/")
          : "";
        return [
          {
            kind: "UnknownEnumValue",
            issueType: ANNOTATION_ISSUE_TYPE,
            message: `Unknown target: ${actualAttributeValueToken.image}`,
            offsetRange: {
              start:
                actualAttributeValueToken.startOffset + correctPart.length + 1,
              end: actualAttributeValueToken.endOffset - 1,
            },
            severity: "warn",
          },
        ];
      } else {
        // segment found but preceding path leads to collection
        originalSegments.splice(lastValidSegmentIndex + 1);
        const correctPart = originalSegments.join("/");
        return [
          {
            kind: "UnknownEnumValue",
            issueType: ANNOTATION_ISSUE_TYPE,
            message: `Multiple 1:many association segments not allowed`,
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
      const annotationList = getAnnotationAppliedOnElement(
        service.convertedMetadata,
        expectedAnnotations,
        target as EntityContainer | EntityType | EntitySet | Singleton
      );

      if (isPropertyPathAllowed(control) || annotationList.length > 0) {
        // path is correct
        return [];
      }

      // Path itself is found but it doesn't suit current context
      const issue: AnnotationIssue = {
        kind: "InvalidAnnotationTarget",
        issueType: ANNOTATION_ISSUE_TYPE,
        message: `Invalid target: ${actualAttributeValueToken.image}`,
        offsetRange: {
          start: actualAttributeValueToken.startOffset,
          end: actualAttributeValueToken.endOffset,
        },
        severity: "warn",
      };

      // TODO: required and actual cardinality mismatch check
      issue.message = `${issue.message}. Trigger code completion to choose one of valid targets if some are available`;
      return [issue];
    }
  }
  return [];
}
