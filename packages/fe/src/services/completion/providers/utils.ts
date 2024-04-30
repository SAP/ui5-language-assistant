import { XMLAttribute } from "@xml-tools/ast";
import {
  AnnotationTargetInXMLAttributeValueCompletion,
  AnnotationTargetInXMLAttributeValueTypeName,
  CompletionSuggestion,
} from "../../../types/completion";
import { getAffectedRange } from "../utils";
import {
  getNextPossibleContextPathTargets,
  getRootElements,
  resolvePathTarget,
  AllowedTargetType,
  isNextSegmentPossible,
} from "../../../utils";
import { ConvertedMetadata } from "@sap-ux/vocabularies-types";
import { AnnotationTerm } from "src/types";

const getSuggestionText = (
  suggestion: CompletionSuggestion,
  completionSegmentIndex: number
): string => {
  const isFullyQualifiedName = [
    "EntityContainer",
    "EntitySet",
    "Singleton",
  ].includes(suggestion.element._type);
  return `${completionSegmentIndex === 0 ? "/" : ""}${
    isFullyQualifiedName && completionSegmentIndex < 2
      ? suggestion.element.fullyQualifiedName
      : suggestion.element.name
  }`;
};

export const sortMap: Record<string, string> = {
  Property: "A",
  NavigationProperty: "B",
  Term: "C",
  EntityType: "D",
  EntitySet: "E",
  Singleton: "F",
  EntityContainer: "Z",
};

export function suggestionToTargetCompletion(
  attribute: XMLAttribute,
  suggestions: CompletionSuggestion[],
  completionIndex: number,
  completionOffset: number
): AnnotationTargetInXMLAttributeValueCompletion[] {
  return suggestions.map((suggestion) => {
    const text = getSuggestionText(suggestion, completionIndex);
    return {
      type: AnnotationTargetInXMLAttributeValueTypeName,
      node: {
        kind: suggestion.element._type,
        name: text,
        text,
        affectedRange: getAffectedRange(
          attribute.syntax.value,
          completionOffset
        ),
        commitCharacters: suggestion.isLastSegment ? [] : ["/"],
        commitCharactersRequired: true,
        sortText: sortMap[suggestion.element._type] + text,
      },
    };
  });
}

export function getRootElementSuggestions(
  metadata: ConvertedMetadata,
  expectedAnnotations: AnnotationTerm[],
  expectedTypes: AllowedTargetType[],
  isPropertyPath: boolean
): CompletionSuggestion[] {
  const roots = getRootElements(
    metadata,
    expectedAnnotations,
    expectedTypes,
    isPropertyPath
  );
  return roots.map((root) => ({
    element: root,
    isLastSegment: !isNextSegmentPossible(metadata, root, {}),
  }));
}

/**
 * Any suggestion after root segment
 */
export function getNavigationSuggestion(
  metadata: ConvertedMetadata,
  precedingPath: string,
  options: {
    isPropertyPath?: boolean;
    allowedTerms?: AnnotationTerm[];
    allowedTargets?: AllowedTargetType[];
    isCollection?: boolean;
  }
): CompletionSuggestion[] {
  const { target, isCollection, milestones } = resolvePathTarget(
    metadata,
    precedingPath
  );
  if (!target) {
    // target not resolved or path leads to collection - no further segments possible
    return [];
  }
  if (target._type === "Property") {
    // no further segments possible after entity property, container is not supported
    return [];
  }

  options = { ...options, isCollection: isCollection ? false : undefined };

  const possibleTargets = getNextPossibleContextPathTargets(
    metadata,
    target,
    options,
    milestones
  );
  const suggestions: CompletionSuggestion[] = [];
  suggestions.push(
    ...possibleTargets.map((t) => {
      const entityType =
        t._type === "NavigationProperty" ? t.targetType : t.entityType;
      return {
        element: t,
        isLastSegment: !isNextSegmentPossible(
          metadata,
          entityType,
          options,
          milestones
        ),
      };
    })
  );
  return suggestions;
}
