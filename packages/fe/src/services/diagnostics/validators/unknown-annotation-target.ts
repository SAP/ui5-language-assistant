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
  normalizePath,
  TypeNameMap,
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
  const ui5Property5MetaPath = getUI5PropertyByXMLAttributeKey(
    { ...attribute, key: "metaPath" },
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
    // it is expected that metaPath property is always defined
    /* istanbul ignore next */
    const {
      expectedAnnotations: expectedAnnotationsMetaPath,
      expectedTypes: expectedTypesMetaPath,
    } = ui5Property5MetaPath
      ? getPathConstraintsForControl(control, ui5Property5MetaPath)
      : { expectedAnnotations: [], expectedTypes: [] };

    const result: AnnotationIssue[] = [];
    const pushToResult = (item: AnnotationIssue) => {
      result.push(item);
      return result;
    };

    let isNotRecommended = false;
    if (expectedAnnotations.length + expectedTypes.length === 0) {
      isNotRecommended = true;
      result.push({
        kind: "ContextPathBindingNotRecommended",
        issueType: ANNOTATION_ISSUE_TYPE,
        message: `Context path for ${control} is usually defined if binding for the object is different than that of the page`,
        offsetRange: {
          start: actualAttributeValueToken.startOffset,
          end: actualAttributeValueToken.endOffset,
        },
        severity: "info",
      });
    }

    // Target is mandatory
    if (!attribute.value) {
      return pushToResult({
        kind: "AnnotationTargetRequired",
        issueType: ANNOTATION_ISSUE_TYPE,
        message:
          "contextPath value cannot be empty. Enter value or remove contextPath property",
        offsetRange: {
          start: actualAttributeValueToken.startOffset,
          end: actualAttributeValueToken.endOffset,
        },
        severity: "warn",
      });
    }

    if (!actualAttributeValue.startsWith("/")) {
      return pushToResult({
        kind: "UnknownEnumValue",
        issueType: ANNOTATION_ISSUE_TYPE,
        message: `Invalid contextPath value: ${actualAttributeValueToken.image}. Absolute path is expected`,
        offsetRange: {
          start: actualAttributeValueToken.startOffset,
          end: actualAttributeValueToken.endOffset,
        },
        severity: "warn",
      });
    }

    const normalizedValue = normalizePath(actualAttributeValue);
    const expectedTypesList = (isNotRecommended
      ? expectedTypesMetaPath
      : expectedTypes
    )
      .map((item) => TypeNameMap[item])
      .join(", ");

    // Check by segments
    const {
      target,
      targetStructuredType: targetEntity,
      isCardinalityIssue,
      lastValidSegmentIndex,
    } = resolvePathTarget(service.convertedMetadata, normalizedValue);
    const originalSegments = actualAttributeValue.split("/");

    if (target?._type === "Property") {
      return pushToResult({
        kind: "UnknownEnumValue",
        issueType: ANNOTATION_ISSUE_TYPE,
        message: `Invalid contextPath value. It leads to entity property, but expected types are: ${expectedTypesList}`,
        offsetRange: {
          start: actualAttributeValueToken.startOffset,
          end: actualAttributeValueToken.endOffset,
        },
        severity: "warn",
      });
    }

    if (target?._type === "EntityContainer") {
      const message = `Path is incomplete. ${
        isNotRecommended
          ? "It leads to entity container"
          : "Trigger code completion to choose next available path segment"
      }`;
      return pushToResult({
        kind: "IncompletePath",
        issueType: ANNOTATION_ISSUE_TYPE,
        message,
        offsetRange: {
          start: actualAttributeValueToken.startOffset,
          end: actualAttributeValueToken.endOffset,
        },
        severity: "warn",
      });
    }

    if (!target || !targetEntity) {
      if (!isCardinalityIssue) {
        // Path does not exist
        originalSegments.splice(lastValidSegmentIndex + 1);
        const correctPart = originalSegments.length
          ? "/" + originalSegments.join("/")
          : "";
        return pushToResult({
          kind: "UnknownEnumValue",
          issueType: ANNOTATION_ISSUE_TYPE,
          message: `Unknown context path: ${actualAttributeValueToken.image}`,
          offsetRange: {
            start:
              actualAttributeValueToken.startOffset + correctPart.length + 1,
            end: actualAttributeValueToken.endOffset - 1,
          },
          severity: "warn",
        });
      } else {
        // segment found but preceding path leads to collection
        originalSegments.splice(lastValidSegmentIndex + 1);
        const correctPart = originalSegments.join("/");
        return pushToResult({
          kind: "UnknownEnumValue",
          issueType: ANNOTATION_ISSUE_TYPE,
          message: `Invalid contextPath value. Multiple 1:many association segments not allowed`,
          offsetRange: {
            start:
              actualAttributeValueToken.startOffset + correctPart.length + 1,
            end: actualAttributeValueToken.endOffset - 1,
          },
          severity: "warn",
        });
      }
    } else {
      if (
        (!isNotRecommended && !expectedTypes.includes(target._type)) ||
        (isNotRecommended && !expectedTypesMetaPath.includes(target._type))
      ) {
        return pushToResult({
          kind: "InvalidAnnotationTarget",
          issueType: ANNOTATION_ISSUE_TYPE,
          message: `Invalid contextPath value. The path leads to ${
            TypeNameMap[target._type]
          }, but expected types are: ${expectedTypesList}`,
          offsetRange: {
            start: actualAttributeValueToken.startOffset,
            end: actualAttributeValueToken.endOffset,
          },
          severity: "warn",
        });
      }

      if (isPropertyPathAllowed(control)) {
        return result;
      }

      let annotationList = getAnnotationAppliedOnElement(
        service.convertedMetadata,
        expectedAnnotations,
        target as EntityContainer | EntityType | EntitySet | Singleton
      );

      if (annotationList.length > 0) {
        // path is correct
        return result;
      }

      annotationList = getAnnotationAppliedOnElement(
        service.convertedMetadata,
        expectedAnnotationsMetaPath,
        target as EntityContainer | EntityType | EntitySet | Singleton
      );

      if (annotationList.length > 0) {
        // path is correct
        return result;
      }

      const message = `Invalid contextPath value. ${
        expectedAnnotations.length === 0
          ? "It does not lead to any annotations of the expected type"
          : "Trigger code completion to choose one of valid targets if some are available"
      }`;
      // Path itself is found but it doesn't suit current context
      const issue: AnnotationIssue = {
        kind: "InvalidAnnotationTarget",
        issueType: ANNOTATION_ISSUE_TYPE,
        message,
        offsetRange: {
          start: actualAttributeValueToken.startOffset,
          end: actualAttributeValueToken.endOffset,
        },
        severity: "warn",
      };

      // TODO: required and actual cardinality mismatch check
      return pushToResult(issue);
    }
  }
  return [];
}
