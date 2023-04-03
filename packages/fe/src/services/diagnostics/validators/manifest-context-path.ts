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
  getContextPath,
  getElementAttributeValue,
  normalizePath,
  resolvePathTarget,
  t,
} from "../../../utils";

export function validateContextPathInManifest(
  attribute: XMLAttribute,
  context: Context
): AnnotationIssue[] {
  const ui5Property = getUI5PropertyByXMLAttributeKey(
    attribute,
    context.ui5Model
  );
  if (
    ui5Property?.library === SAP_FE_MACROS &&
    ui5Property.name === "metaPath"
  ) {
    const actualAttributeValue = attribute.value;
    const actualAttributeValueToken = attribute.syntax.value;
    if (
      actualAttributeValue === null ||
      actualAttributeValueToken === undefined ||
      isPossibleBindingAttributeValue(actualAttributeValue)
    ) {
      return [];
    }

    const mainServicePath = context.manifestDetails.mainServicePath;
    const service = mainServicePath
      ? context.services[mainServicePath]
      : undefined;
    if (!service) {
      return [];
    }

    const element = attribute.parent;
    const contextPathAttr = getElementAttributeValue(element, "contextPath");
    if (typeof contextPathAttr !== "undefined") {
      // context path provided via attribute
      return [];
    }
    const contextPath = getContextPath(undefined, context);
    if (!contextPath) {
      // empty context path is ignored
      return [];
    }

    const result: AnnotationIssue[] = [];
    const pushToResult = (item: AnnotationIssue) => {
      result.push(item);
      return result;
    };

    // relative context path
    if (!contextPath.startsWith("/")) {
      return pushToResult({
        kind: "InvalidAnnotationTarget",
        issueType: ANNOTATION_ISSUE_TYPE,
        message: t("RELATIVE_CONTEXT_PATH_IN_MANIFEST", {
          value: contextPath,
        }),
        offsetRange: {
          start: actualAttributeValueToken.startOffset,
          end: actualAttributeValueToken.endOffset,
        },
        severity: "warn",
      });
    }

    // resolve context path
    const normalizedValue = normalizePath(contextPath);
    const { target, isCardinalityIssue } = resolvePathTarget(
      service.convertedMetadata,
      normalizedValue
    );

    // wrong target type
    if (target?._type === "Property") {
      return pushToResult({
        kind: "UnknownEnumValue",
        issueType: ANNOTATION_ISSUE_TYPE,
        message: t("CONTEXT_PATH_LEADS_TO_WRONG_TARGET", {
          actualType: "Edm.Property",
          expectedTypes: [
            "Edm.EntityType",
            "Edm.EntitySet",
            "Edm.NavigationProperty",
          ],
        }),
        offsetRange: {
          start: actualAttributeValueToken.startOffset,
          end: actualAttributeValueToken.endOffset,
        },
        severity: "warn",
      });
    }

    // incomplete path
    if (target?._type === "EntityContainer") {
      const message = t(
        "INCOMPLETE_CONTEXT_PATH_IN_MANIFEST_LEADS_TO_ENTITY_CONTAINER"
      );
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

    // unresolved
    if (!target) {
      if (isCardinalityIssue) {
        // segment found but preceding path leads to collection
        return pushToResult({
          kind: "UnknownEnumValue",
          issueType: ANNOTATION_ISSUE_TYPE,
          message: t("INVALID_CONTEXT_PATH_IN_MANIFEST_MULTIPLE_1_TO_MANY"),
          offsetRange: {
            start: actualAttributeValueToken.startOffset,
            end: actualAttributeValueToken.endOffset,
          },
          severity: "warn",
        });
      } else {
        // Path does not exist
        return pushToResult({
          kind: "UnknownEnumValue",
          issueType: ANNOTATION_ISSUE_TYPE,
          message: t("UNKNOWN_CONTEXT_PATH_IN_MANIFEST", {
            value: contextPath,
          }),
          offsetRange: {
            start: actualAttributeValueToken.startOffset,
            end: actualAttributeValueToken.endOffset,
          },
          severity: "warn",
        });
      }
    }
  }
  return [];
}
