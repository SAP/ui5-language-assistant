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
} from "../../../utils";
import { getAnnotationAppliedOnElement } from "../../../utils";

import { EntityType } from "@sap-ux/vocabularies-types";

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
    let contextPath = getElementAttributeValue(element, "contextPath");
    const entitySet =
      context.manifestDetails.customViews[context.customViewId || ""]
        ?.entitySet ?? "";

    let isNavSegmentsAllowed = true;
    let base: ResolvedPathTargetType | undefined;
    let baseType: EntityType | undefined;
    let normalizedContextPath: string;

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
    const { expectedAnnotations } = getPathConstraintsForControl(
      control,
      ui5Property
    );

    if (!base || base._type === "Property") {
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
    if (segments.length > 1 && !segments[0]) {
      // absolute path not allowed
      return [
        {
          kind: "InvalidAnnotationTerm",
          issueType: ANNOTATION_ISSUE_TYPE,
          message: t("ABSOLUTE_ANNOTATION_PATH_NOT_ALLOWED"),
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

    let targetEntity: EntityType | undefined = baseType;
    let lastValidSegmentIndex = -1;
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

    if (!targetEntity) {
      originalSegments.splice(lastValidSegmentIndex + 1);
      const correctPart = originalSegments.join("/");
      return [
        {
          kind: "PathDoesNotExist",
          issueType: ANNOTATION_ISSUE_TYPE,
          message: t("UNKNOWN_ANNOTATION_PATH", {
            value: `${normalizedContextPath}/${attribute.value}`,
          }),
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
            base
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
            value: `${normalizedContextPath}/${attribute.value}`,
          }),
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

function composeAnnotationPath(annotation: AnnotationBase): string {
  return `@${
    annotation.qualifier
      ? `${annotation.term}#${annotation.qualifier}`
      : annotation.term
  }`;
}
