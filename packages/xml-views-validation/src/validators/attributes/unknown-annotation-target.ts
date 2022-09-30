import { XMLAttribute } from "@xml-tools/ast";
import { AppContext } from "@ui5-language-assistant/semantic-model-types";
import {
  getAllowedAnnotationsTermsForControl,
  getUI5PropertyByXMLAttributeKey,
} from "@ui5-language-assistant/logic-utils";
import { AnnotationIssue, UnknownEnumValueIssue } from "../../../api";
import { isPossibleBindingAttributeValue } from "../../utils/is-binding-attribute-value";
import {
  collectAnnotationsForType,
  getNavigationTargets,
} from "@ui5-language-assistant/xml-views-completion";

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
    const isCollection: boolean | undefined = getIsCollection();

    // Check by direct option match
    const targets = (allowedTerms.length
      ? service.convertedMetadata.entityTypes.filter((entity) => {
          const annotationList = collectAnnotationsForType(
            service.convertedMetadata,
            entity.fullyQualifiedName,
            allowedTerms
          );
          return annotationList.length > 0;
        })
      : service.convertedMetadata.entityTypes
    ).map((target) => `/${target.name}`);

    const allowedTargets = [
      ...targets,
      ...getNavigationTargets(service, {
        allowedTerms,
        isCollection,
        isPropertyPath: control === "Field",
      }),
    ];

    if (allowedTargets.includes(actualAttributeValue)) {
      return [];
    }

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

    // Check by segments
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

    const segments = actualAttributeValue.split("/");
    segments.shift();
    const originalSegments = [...segments];
    let lastValidSegmentIndex = -1;
    let targetEntity = service.convertedMetadata.entityTypes.find(
      (entityType) => entityType.name === segments[0]
    );
    segments.shift();
    let isNextSegmentPossible = true;
    let isPathLeadingToCollection = false;
    let isPathFound = !!targetEntity;

    for (const segment of segments) {
      if (!targetEntity) {
        break;
      }
      if (!isNextSegmentPossible) {
        targetEntity = undefined;
        break;
      }
      lastValidSegmentIndex++;
      const navProperty = targetEntity.navigationProperties.find(
        (p) => p.name === segment
      );
      targetEntity = navProperty?.targetType;
      isPathFound = !!targetEntity;
      isPathLeadingToCollection =
        isPathLeadingToCollection || !!navProperty?.isCollection;
      isNextSegmentPossible = isPathFound && !isPathLeadingToCollection;
    }

    if (!targetEntity) {
      if (!isPathFound) {
        // Path does not exist
        originalSegments.splice(lastValidSegmentIndex + 1);
        const correctPart = originalSegments.length
          ? "/" + originalSegments.join("/")
          : "";
        return [
          {
            kind: "UnknownEnumValue",
            message: `Unknown annotation target: ${actualAttributeValueToken.image}`,
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
            message: `Any further segments after collection valued segment not allowed`,
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
      // Path itself is correct but doesn't suit current context
      const issue = {
        kind: "InvalidAnnotationTarget",
        message: `Invalid annotation target: ${actualAttributeValueToken.image}`,
        offsetRange: {
          start: actualAttributeValueToken.startOffset,
          end: actualAttributeValueToken.endOffset,
        },
        severity: "warn",
      } as AnnotationIssue;

      if (allowedTargets.length === 0) {
        issue.message = `${issue.message}. There are no annotations in the project that are suitable for the current element`;
      } else if (isCollection === false && isPathLeadingToCollection) {
        issue.message = `${issue.message}. Path should lead to 1-to-1 associated entity. Trigger code completion to choose one of available annotation targets`;
      } else if (isCollection === true && !isPathLeadingToCollection) {
        issue.message = `${issue.message}. Path should lead to entity collection. Trigger code completion to choose one of available annotation targets`;
      } else {
        issue.message = `${issue.message}. Trigger code completion to choose one of available annotation targets`;
      }
      return [issue];
    }
  }
  return [];
}

function getIsCollection() {
  return undefined;
}
