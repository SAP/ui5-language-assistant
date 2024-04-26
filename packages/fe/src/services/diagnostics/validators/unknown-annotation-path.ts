import { XMLAttribute } from "@xml-tools/ast";
import { Context } from "@ui5-language-assistant/context";
import { getUI5PropertyByXMLAttributeKey } from "@ui5-language-assistant/logic-utils";
import { isPossibleBindingAttributeValue } from "@ui5-language-assistant/xml-views-validation";
import {
  AnnotationBase,
  AnnotationIssue,
  AnnotationTerm,
  ANNOTATION_ISSUE_TYPE,
  SAP_FE_MACROS,
} from "../../../types";
import {
  fullyQualifiedNameToTerm,
  getPathConstraintsForControl,
  getElementAttributeValue,
  isPropertyPathAllowed,
  ResolvedPathTargetType,
  resolvePathTarget,
  normalizePath,
  t,
  getContextPath,
  TypeNameMap,
} from "../../../utils";
import { getAnnotationAppliedOnElement } from "../../../utils";

import { EntityType, Property } from "@sap-ux/vocabularies-types";

const getMessageValue = (
  isAbsolutePath: boolean,
  value: string | null,
  normalizedContext: string | undefined
): string => {
  if (!value) {
    return "";
  }
  if (isAbsolutePath) {
    return value;
  }
  if (normalizedContext) {
    return `${normalizedContext}/${value}`;
  }
  return value;
};

export function validateUnknownAnnotationPath(
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const control = element.name!;

    const mainServicePath = context.manifestDetails.mainServicePath;
    const service = mainServicePath
      ? context.services[mainServicePath]
      : undefined;
    if (!service) {
      return [];
    }
    const metadata = service.convertedMetadata;
    const contextPathAttr = getElementAttributeValue(element, "contextPath");
    let contextPath = getContextPath(contextPathAttr, context);

    const entitySet =
      context.manifestDetails.customViews[context.customViewId || ""]
        ?.entitySet ?? "";

    const isAbsolutePath = actualAttributeValue.startsWith("/");

    let isNavSegmentsAllowed = true;
    let base: ResolvedPathTargetType | undefined;
    let baseType: EntityType | undefined;
    let normalizedContextPath: string | undefined;

    // resolve context and get annotations for it
    if (typeof contextPath === "string") {
      if (!contextPath.startsWith("/")) {
        return [];
      }
      normalizedContextPath = normalizePath(contextPath);
      ({ target: base, targetStructuredType: baseType } = resolvePathTarget(
        metadata,
        normalizedContextPath
      ));
      isNavSegmentsAllowed = typeof contextPathAttr === "undefined";
    } else if (!isAbsolutePath) {
      if (!entitySet) {
        return [];
      }
      contextPath = `/${entitySet}`;
      normalizedContextPath = contextPath;
      base = service.convertedMetadata.entitySets.find(
        (e) => e.name === entitySet
      );
      baseType = base?.entityType;
      if (entitySet && !base) {
        return [
          {
            kind: "InvalidAnnotationTarget",
            issueType: ANNOTATION_ISSUE_TYPE,
            message: t("VIEW_ENTITY_SET_IS_NOT_FOUND", { value: entitySet }),
            offsetRange: {
              start: actualAttributeValueToken.startOffset,
              end: actualAttributeValueToken.endOffset,
            },
            severity: "info",
          },
        ];
      }
    }
    const { expectedAnnotations, expectedTypes } = getPathConstraintsForControl(
      control,
      ui5Property
    );

    if (!isAbsolutePath && (!base || base._type === "Property")) {
      return [];
    }

    if (!actualAttributeValue && !isPropertyPathAllowed(control)) {
      return [
        {
          kind: "AnnotationPathRequired",
          issueType: ANNOTATION_ISSUE_TYPE,
          message: t("ANNOTATION_PATH_IS_MANDATORY"),
          offsetRange: {
            start: actualAttributeValueToken.startOffset,
            end: actualAttributeValueToken.endOffset,
          },
          severity: "warn",
        },
      ];
    }

    if (isPropertyPathAllowed(control)) {
      // another validator takes care
      return [];
    }

    if (!actualAttributeValue.includes("@")) {
      // The value seem to be a property path
      return [
        {
          kind: "PropertyPathNotAllowed",
          issueType: ANNOTATION_ISSUE_TYPE,
          message: t("PATH_VALUE_MUST_END_WITH_A_TERM"),
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
    const termSegmentIndex = segments.findIndex((segment) =>
      segment.includes("@")
    );
    segments.splice(termSegmentIndex);
    if (segments.length > 0 && !isNavSegmentsAllowed) {
      return [
        {
          kind: "InvalidAnnotationTerm",
          issueType: ANNOTATION_ISSUE_TYPE,
          message: t(
            "NAVIGATION_SEGMENTS_NOT_ALLOWED_WHEN_CONTEXT_PATH_EXISTS"
          ),
          offsetRange: {
            start: actualAttributeValueToken.startOffset,
            end: actualAttributeValueToken.endOffset,
          },
          severity: "warn",
        } as AnnotationIssue,
      ];
    }
    let targetEntity: ResolvedPathTargetType | undefined = baseType;
    let lastValidSegmentIndex = -1;
    if (isAbsolutePath) {
      const resolvedPathTarget = resolvePathTarget(
        service.convertedMetadata,
        segments.join("/"),
        baseType
      );
      targetEntity = resolvedPathTarget.target;
      lastValidSegmentIndex = resolvedPathTarget.lastValidSegmentIndex;
    } else {
      for (const segment of segments) {
        if (!targetEntity) {
          break;
        }
        const navProperty = (
          targetEntity as EntityType
        ).navigationProperties.find((p) => p.name === segment);

        targetEntity = navProperty?.targetType;
        if (targetEntity) {
          lastValidSegmentIndex++;
        }
      }
    }
    if (!targetEntity) {
      originalSegments.splice(lastValidSegmentIndex + 1);
      const correctPart = originalSegments.join("/");
      return [
        {
          kind: "PathDoesNotExist",
          issueType: ANNOTATION_ISSUE_TYPE,
          message: t("UNKNOWN_ANNOTATION_PATH", {
            value: getMessageValue(
              isAbsolutePath,
              attribute.value,
              normalizedContextPath
            ),
          }),
          offsetRange: {
            start:
              actualAttributeValueToken.startOffset + correctPart.length + 1,
            end: actualAttributeValueToken.endOffset - 1,
          },
          severity: "warn",
        },
      ];
    }
    if (targetEntity._type === "Property") {
      const expectedTypesList = expectedTypes
        .map((item) => TypeNameMap[item])
        .join(", ");
      return [
        {
          kind: "UnknownEnumValue",
          issueType: ANNOTATION_ISSUE_TYPE,
          message: t("CONTEXT_PATH_LEADS_TO_WRONG_TARGET", {
            actualType: "Edm.Property",
            expectedTypes: expectedTypesList,
          }),
          offsetRange: {
            start: actualAttributeValueToken.startOffset,
            end: actualAttributeValueToken.endOffset,
          },
          severity: "warn",
        },
      ];
    }

    base = base as Exclude<ResolvedPathTargetType, Property>;
    const termSegment = originalSegments[termSegmentIndex];
    const parts = termSegment.split("@");
    let annotations: AnnotationBase[] | undefined;

    annotations = getAnnotationAppliedOnElement(
      expectedAnnotations,
      segments.length === 0 ? base : targetEntity,
      parts[0]
    );

    const match = annotations.find(
      (anno) => composeAnnotationPath(anno) === "@" + parts[1]
    );
    if (match) {
      return [];
    } else {
      // check whether the provided term exists on target
      const term: AnnotationTerm = fullyQualifiedNameToTerm(parts[1]);
      annotations = getAnnotationAppliedOnElement(
        [term],
        segments.length === 0 ? base : targetEntity,
        parts[0]
      );
      const match = annotations.find(
        (anno) => composeAnnotationPath(anno) === "@" + parts[1]
      );
      if (match) {
        // determine whether any allowed term exists in the project suitable for the current context
        annotations = getAnnotationAppliedOnElement(
          expectedAnnotations,
          segments.length === 0 ? base : targetEntity
        );

        return [
          {
            kind: "InvalidAnnotationTerm",
            issueType: ANNOTATION_ISSUE_TYPE,
            message: t(
              annotations.length
                ? "INVALID_ANNOTATION_TERM_TRIGGER_CODE_COMPLETION"
                : "INVALID_ANNOTATION_TERM_THERE_ARE_NO_SUITABLE_ANNOTATIONS",
              { value: attribute.value }
            ),
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
        issueType: ANNOTATION_ISSUE_TYPE,
        message: t("UNKNOWN_ANNOTATION_PATH", {
          value: getMessageValue(
            isAbsolutePath,
            attribute.value,
            normalizedContextPath
          ),
        }),
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

function composeAnnotationPath(annotation: AnnotationBase): string {
  return `@${
    annotation.qualifier
      ? `${annotation.term}#${annotation.qualifier}`
      : annotation.term
  }`;
}
