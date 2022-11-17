import { XMLAttribute } from "@xml-tools/ast";
import { AppContext } from "@ui5-language-assistant/semantic-model-types";
import {
  getAllowedAnnotationsTermsForControl,
  getUI5PropertyByXMLAttributeKey,
  isPropertyPathAllowed,
  resolvePathTarget,
} from "@ui5-language-assistant/logic-utils";
import { AnnotationIssue, UnknownEnumValueIssue } from "../../../api";
import { isPossibleBindingAttributeValue } from "../../utils/is-binding-attribute-value";
import { getAnnotationAppliedOnElement } from "./unknown-annotation-path";

export function validateUnknownAnnotationTarget(
  attribute: XMLAttribute,
  context: AppContext
): (AnnotationIssue | UnknownEnumValueIssue)[] {
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
    ui5Property.name === "contextPath"
  ) {
    const element = attribute.parent;
    const control = element.name || "";
    const mainServicePath = context.manifest?.mainServicePath;
    const service = mainServicePath
      ? context.services[mainServicePath]
      : undefined;
    if (!service) {
      return [];
    }

    const allowedTerms = getAllowedAnnotationsTermsForControl(control);
    // const isCollection: boolean | undefined = getIsCollection();

    // Target is mandatory
    if (!attribute.value) {
      return [
        {
          kind: "AnnotationTargetRequired",
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
          message: `Unknown annotation target: ${actualAttributeValueToken.image}`,
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
        const correctPart = originalSegments.length
          ? "/" + originalSegments.join("/")
          : "";
        return [
          {
            kind: "UnknownEnumValue",
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
    } else if (
      !["EntityType", "EntitySet", "Singleton"].includes(target._type)
    ) {
      return [
        {
          kind: "UnknownEnumValue",
          message: `Wrong target: ${actualAttributeValueToken.image}`,
          offsetRange: {
            start: actualAttributeValueToken.startOffset,
            end: actualAttributeValueToken.endOffset,
          },
          severity: "warn",
        },
      ];
    } else {
      if (target._type === "Property") {
        return []; // not supported yet
      }
      const annotationList = getAnnotationAppliedOnElement(
        service.convertedMetadata,
        allowedTerms,
        target
      );

      if (isPropertyPathAllowed(control) || annotationList.length > 0) {
        // path is correct
        return [];
      }

      // Path itself is found but it doesn't suit current context
      const issue = {
        kind: "InvalidAnnotationTarget",
        message: `Invalid target: ${actualAttributeValueToken.image}`,
        offsetRange: {
          start: actualAttributeValueToken.startOffset,
          end: actualAttributeValueToken.endOffset,
        },
        severity: "warn",
      } as AnnotationIssue;

      if (isCollection === false && isCollection) {
        issue.message = `${issue.message}. Path should lead to 1-to-1 associated entity. Trigger code completion to choose one of available targets`;
      } else if (isCollection === true && !isCollection) {
        issue.message = `${issue.message}. Path should lead to collection valued target. Trigger code completion to choose one of available targets`;
      } else {
        issue.message = `${issue.message}. Trigger code completion to choose one of valid targets if some are available`;
      }
      return [issue];
    }
  }
  return [];
}
