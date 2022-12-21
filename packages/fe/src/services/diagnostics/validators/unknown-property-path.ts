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
  normalizePath,
  resolvePathTarget,
  TypeNameMap,
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
    let normalizedContextPath: string;

    // resolve context
    if (typeof contextPath === "string") {
      if (!contextPath.startsWith("/")) {
        return [];
      }
      normalizedContextPath = normalizePath(contextPath);
      ({ target: base, targetStructuredType: baseType } = resolvePathTarget(
        metadata,
        normalizedContextPath
      ));
      isNavSegmentsAllowed = false;
    } else {
      if (!entitySet) {
        return [];
      }
      contextPath = `/${entitySet}`;
      normalizedContextPath = contextPath;
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
          message: "metaPath value cannot be empty",
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

    const normalizedValue = normalizePath(actualAttributeValue);
    const {
      target,
      targetStructuredType: targetEntity,
      isCardinalityIssue,
      lastValidSegmentIndex,
    } = resolvePathTarget(service.convertedMetadata, normalizedValue, baseType);

    if (target?._type === "Property") {
      return [];
    }

    if (target?._type === "EntityContainer") {
      return [
        {
          kind: "IncompletePath",
          issueType: ANNOTATION_ISSUE_TYPE,
          message: `Invalid path value. The path leads to ${
            TypeNameMap[target._type]
          }, but expected type is Edm.Property`,
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
            kind: "UnknownPropertyPath",
            issueType: ANNOTATION_ISSUE_TYPE,
            message: `Unknown path: "${
              actualAttributeValue.trim().startsWith("/")
                ? ""
                : normalizedContextPath + "/"
            }${attribute.value}"`,
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
            kind: "UnknownPropertyPath",
            issueType: ANNOTATION_ISSUE_TYPE,
            message: `Invalid property path value. Multiple 1:many association segments not allowed`,
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
      return [
        {
          kind: "PropertyPathRequired",
          issueType: ANNOTATION_ISSUE_TYPE,
          message: `Invalid path value. The path leads to ${
            TypeNameMap[target._type]
          }, but expected type is Edm.Property`,
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
