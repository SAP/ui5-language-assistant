import { getUI5PropertyByXMLAttributeKey } from "@ui5-language-assistant/logic-utils";
import {
  getPathConstraintsForControl,
  getNextPossibleContextPathTargets,
  getRootElements,
  resolvePathTarget,
} from "../../../utils";
import { AnnotationTargetInXMLAttributeValueCompletion } from "../../../types";

import { UI5AttributeValueCompletionOptions } from "./index";
import {
  EntityContainer,
  EntitySet,
  EntityType,
  NavigationProperty,
  Singleton,
} from "@sap-ux/vocabularies-types";
import { getAffectedRange } from "../utils";

type ApplicableMetadataElement =
  | EntityContainer
  | EntitySet
  | EntityType
  | Singleton
  | NavigationProperty;

interface CompletionSuggestion {
  element: ApplicableMetadataElement;
  isLastSegment: boolean;
}

/**
 * Suggests values for macros contextPath
 */
export function contextPathSuggestions({
  element,
  attribute,
  context,
  prefix,
}: UI5AttributeValueCompletionOptions): AnnotationTargetInXMLAttributeValueCompletion[] {
  const ui5Property = getUI5PropertyByXMLAttributeKey(
    attribute,
    context.ui5Model
  );

  if (
    ui5Property?.library === "sap.fe.macros" &&
    ui5Property.name === "contextPath"
  ) {
    const mainServicePath = context.manifestDetails?.mainServicePath;
    const service = mainServicePath
      ? context.services[mainServicePath]
      : undefined;
    if (!service) {
      return [];
    }
    const metadata = service.convertedMetadata;
    const { expectedAnnotations, expectedTypes } = getPathConstraintsForControl(
      element.name,
      ui5Property
    );
    const isPropertyPath = expectedTypes.includes("Property");
    const suggestions: CompletionSuggestion[] = [];
    const segments = (attribute.value || "").split("/");
    const precedingSegments = (prefix || "").split("/");
    const completionSegmentIndex = precedingSegments.length - 1;
    precedingSegments.pop();
    const completionSegmentOffset =
      precedingSegments.join("/").length + (precedingSegments.length ? 1 : 0);
    const isAbsolutePath = segments.length > 1 && !segments[0];
    if (!isAbsolutePath && completionSegmentIndex > 0) {
      // relative paths are not supported
      return [];
    }
    if (expectedAnnotations.length + expectedTypes.length === 0) {
      return [];
    }
    // if (!isPropertyPath && expectedAnnotations.length === 0) {
    //   return [];
    // }

    const isNextSegmentPossible = (
      currentTarget: EntitySet | EntityType | Singleton | EntityContainer,
      milestones: string[] = []
    ): boolean => {
      return (
        getNextPossibleContextPathTargets(
          service.convertedMetadata,
          currentTarget,
          {
            allowedTerms: expectedAnnotations,
            allowedTargets: expectedTypes,
            isPropertyPath,
          },
          [...milestones, currentTarget.fullyQualifiedName]
        ).length > 0
      );
    };

    if (completionSegmentIndex < 2) {
      // completion for root element
      const roots = getRootElements(
        metadata,
        expectedAnnotations,
        expectedTypes,
        isPropertyPath
      );
      suggestions.push(
        ...roots.map((root) => ({
          element: root,
          isLastSegment: !isNextSegmentPossible(root),
          completionSegmentIndex,
        }))
      );
    } else {
      // completion for navigation property segment
      const precedingPath = segments.slice(0, completionSegmentIndex).join("/");
      const { target, isCollection, milestones } = resolvePathTarget(
        service.convertedMetadata,
        precedingPath
      );
      if (!target) {
        // target not resolved or path leads to collection - no further segments possible
        return [];
      } else if (target._type === "Property") {
        // no further segments possible after entity property, container is not supported
        return [];
      } else {
        const possibleTargets = getNextPossibleContextPathTargets(
          service.convertedMetadata,
          target,
          {
            allowedTerms: expectedAnnotations,
            allowedTargets: expectedTypes,
            isPropertyPath,
            isCollection: isCollection ? false : undefined,
          },
          milestones
        );
        suggestions.push(
          ...possibleTargets.map((t) => {
            const entityType =
              t._type === "NavigationProperty" ? t.targetType : t.entityType;
            return {
              element: t,
              isLastSegment: !isNextSegmentPossible(entityType, milestones),
              completionSegmentIndex,
            };
          })
        );
      }
    }

    const sortMap: Record<string, string> = {
      EntityContainer: "Z",
      EntityType: "A",
      EntitySet: "B",
      Singleton: "C",
      NavigationProperty: "N",
    };

    return suggestions.map((suggestion) => {
      const text = `${completionSegmentIndex === 0 ? "/" : ""}${
        ["EntityContainer", "EntitySet", "Singleton"].includes(
          suggestion.element._type
        ) && completionSegmentIndex < 2
          ? suggestion.element.fullyQualifiedName
          : suggestion.element.name
      }`;
      return {
        type: "AnnotationTargetInXMLAttributeValue",
        node: {
          kind: suggestion.element._type,
          name: text,
          text,
          affectedRange: getAffectedRange(
            attribute.syntax.value,
            completionSegmentOffset
          ),
          commitCharacters: suggestion.isLastSegment ? [] : ["/"],
          commitCharactersRequired: true,
          sortText: sortMap[suggestion.element._type] + text,
        },
      };
    });
  }
  return [];
}
