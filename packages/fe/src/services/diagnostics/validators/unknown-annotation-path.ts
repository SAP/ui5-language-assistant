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

    // let annotationList: AnnotationLookupResultEntry[] | undefined;

    // const annotationListAssoc: { navSegment: string; annotations: any[] }[] = [];
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
    let base: ResolvedPathTargetType | undefined;
    let baseType: EntityType | undefined;

    // resolve context and get annotations for it
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
          message: "Annotation path is required",
          offsetRange: {
            start: actualAttributeValueToken.startOffset,
            end: actualAttributeValueToken.endOffset,
          },
          severity: "warn",
        },
      ];
    }
    if (!actualAttributeValue.includes("@")) {
      if (isPropertyPathAllowed(control)) {
        // The value seem to be a property path, another validator takes care
        return [];
      } else {
        return [
          {
            kind: "PropertyPathNotAllowed",
            issueType: ANNOTATION_ISSUE_TYPE,
            message: `Property path not allowed. Use code completion to select annotation path`,
            offsetRange: {
              start: actualAttributeValueToken.startOffset,
              end: actualAttributeValueToken.endOffset,
            },
            severity: "warn",
          },
        ];
      }
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
          message: `Absolute annotation paths not allowed in metaPath. Use contextPath attribute to change path context`,
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
          message: `Path does not exist: "${contextPath}/${attribute.value}"`,
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
      let annos: AnnotationBase[] | undefined;
      annos = getAnnotationAppliedOnElement(
        metadata,
        expectedAnnotations,
        segments.length === 0 ? base : targetEntity,
        parts[0]
      );

      const match = annos.find(
        (anno) => composeAnnotationPath(anno) === "@" + parts[1]
      );
      if (match) {
        return [];
      } else {
        // check whether the provided term exists on target
        const term: AnnotationTerm = fullyQualifiedNameToTerm(parts[1]);
        annos = getAnnotationAppliedOnElement(
          metadata,
          [term],
          segments.length === 0 ? base : targetEntity,
          parts[0]
        );
        const match = annos.find(
          (anno) => composeAnnotationPath(anno) === "@" + parts[1]
        );
        if (match) {
          // determine whether any allowed term exists in the project suitable for the current context
          annos = getAnnotationAppliedOnElement(
            metadata,
            expectedAnnotations,
            base
          );
          const messageAddOn = annos.length
            ? `Trigger code completion to choose one of allowed annotations`
            : `There are no annotations in the project that are suitable for the current context`;

          return [
            {
              kind: "InvalidAnnotationTerm",
              issueType: ANNOTATION_ISSUE_TYPE,
              message: `Invalid annotation term: "${attribute.value}". ${messageAddOn}`,
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
          message: `Path does not exist: "${contextPath}/${attribute.value}"`,
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
