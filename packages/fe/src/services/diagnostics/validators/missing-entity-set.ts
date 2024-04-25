import { XMLAttribute } from "@xml-tools/ast";
import { Context } from "@ui5-language-assistant/context";
import { getUI5PropertyByXMLAttributeKey } from "@ui5-language-assistant/logic-utils";
import { isPossibleBindingAttributeValue } from "@ui5-language-assistant/xml-views-validation";
import {
  AnnotationIssue,
  ANNOTATION_ISSUE_TYPE,
  SAP_FE_MACROS,
} from "../../../types";
import { getContextPath, getElementAttributeValue, t } from "../../../utils";

export function validateMissingViewEntitySet(
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
    const isAbsolutePath = actualAttributeValue.startsWith("/");
    if (isAbsolutePath) {
      return [];
    }
    const element = attribute.parent;
    const contextPathAttr = getElementAttributeValue(element, "contextPath");
    const contextPath = getContextPath(contextPathAttr, context);
    const entitySet =
      (context.manifestDetails?.customViews || {})[context.customViewId || ""]
        ?.entitySet ?? "";

    // resolve context and get annotations for it
    if (typeof contextPath === "string") {
      return [];
    } else {
      if (!entitySet) {
        return [
          {
            kind: "MissingEntitySet",
            issueType: ANNOTATION_ISSUE_TYPE,
            message: t("ENTITY_SET_OR_CONTEXT_PATH_IS_MISSING_IN_MANIFEST"),
            offsetRange: {
              start: actualAttributeValueToken.startOffset,
              end: actualAttributeValueToken.endOffset,
            },
            severity: "info",
          },
        ];
      }
    }
  }
  return [];
}
