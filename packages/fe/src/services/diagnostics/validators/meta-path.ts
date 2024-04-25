import { XMLAttribute } from "@xml-tools/ast";
import { Context } from "@ui5-language-assistant/context";
import { getUI5PropertyByXMLAttributeKey } from "@ui5-language-assistant/logic-utils";
import { isPossibleBindingAttributeValue } from "@ui5-language-assistant/xml-views-validation";
import {
  AnnotationIssue,
  ANNOTATION_ISSUE_TYPE,
  SAP_FE_MACROS,
  ContextPathOrigin,
} from "../../../types";
import {
  getContextPath,
  getElementAttributeValue,
  getPathConstraintsForControl,
  isPropertyPathAllowed,
  normalizePath,
  resolveContextPath,
  resolvePathTarget,
  t,
  TypeNameMap,
} from "../../../utils";

import {
  EntityContainer,
  EntitySet,
  EntityType,
  Singleton,
  Property,
} from "@sap-ux/vocabularies-types";

/**
 * absolute path
 *
 * non-absolute
 *
 * UnknownEnumValueIssue - any invalid path segment or property does not exits in path
 * UnknownAnnotationPathIssue - not used
 * AnnotationTargetRequiredIssue - target is mandatory
 * AnnotationPathRequiredIssue - probabally when metpath is empty or in complete
 * PathDoesNotExistIssue - any invalid segment in path
 *
 */
export function validateMetaPath(
  attribute: XMLAttribute,
  context: Context
): AnnotationIssue[] {
  let isNavSegmentsAllowed = true;
  let base:
    | EntityContainer
    | EntitySet
    | EntityType
    | Singleton
    | Property
    | undefined;
  let baseType: EntityType | undefined;
  let normalizedContextPath: string;

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
    ui5Property?.library !== SAP_FE_MACROS ||
    ui5Property.name !== "metaPath"
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
  let value = attribute.value;
  const control = element.name;
  if (!value) {
    // todo
    return [];
  }
  const isAbsolutePath = value.startsWith("/");

  if (!isAbsolutePath) {
    return [];
  }

  let proceedingPath = value;
  let lastSegment = "";

  if (value.includes("@")) {
    // it must be annotation path
    const parts = value.split("/");
    lastSegment = parts.pop() ?? "";
    proceedingPath = parts.join("/");
  }

  const resolvedContext = resolveContextPath(
    context,
    element,
    isAbsolutePath,
    proceedingPath
  );

  if (!resolvedContext) {
    return [];
  }
  // /travel/to_nave/
  const { contextPath, origin } = resolvedContext;

  const { expectedAnnotations, expectedTypes } = getPathConstraintsForControl(
    control,
    ui5Property
  );
  const isPropertiesAllowed = expectedTypes.includes("Property");
  const metadata = service.convertedMetadata;
  let isCollection: boolean | undefined;
  let lastValidSegmentIndex: number;
  let isCardinalityIssue: boolean;
  let milestones: string[];
  normalizedContextPath = normalizePath(contextPath);
  ({
    target: base,
    targetStructuredType: baseType,
    isCardinalityIssue,
    isCollection,
    lastValidSegmentIndex,
    milestones,
  } = resolvePathTarget(metadata, normalizedContextPath));

  if (!base) {
    // not resolved. issue can be either in contextPath in manifest.json, or  entity set. contePath in xml may be handled somewhere else.
    // todo
    if (isPropertiesAllowed) {
      return [
        {
          kind: "UnknownEnumValue",
          issueType: ANNOTATION_ISSUE_TYPE,
          message: `Wrong path ${value}`,
          offsetRange: {
            start: actualAttributeValueToken.startOffset,
            end: actualAttributeValueToken.endOffset,
          },
          severity: "warn",
        },
      ];
    }
    return [];
  }

  if (isPropertiesAllowed && base._type !== "Property") {
    return [
      {
        kind: "UnknownEnumValue",
        issueType: ANNOTATION_ISSUE_TYPE,
        message: `Path must ends with property path ${value}`,
        offsetRange: {
          start: actualAttributeValueToken.startOffset,
          end: actualAttributeValueToken.endOffset,
        },
        severity: "warn",
      },
    ];
  }

  if (!isPropertiesAllowed && expectedAnnotations.length > 0) {
    // check last segment
    const termName = lastSegment.slice(0, lastSegment.indexOf("#"));
    const term = expectedAnnotations.find(
      (i) => termName === `@${i.fullyQualifiedName}`
    );
    if (!term) {
      // missing annotation term
      return [
        {
          kind: "AnnotationPathRequired",
          issueType: ANNOTATION_ISSUE_TYPE,
          message: `Term is either missing or wrong ${value}`,
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
