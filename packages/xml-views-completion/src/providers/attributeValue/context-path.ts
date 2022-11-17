import {
  getAllowedAnnotationsTermsForControl,
  getNextPossiblePathTargets,
  getRootElements,
  getUI5PropertyByXMLAttributeKey,
  isPropertyPathAllowed,
  resolvePathTarget,
} from "@ui5-language-assistant/logic-utils";

import { AnnotationTargetInXMLAttributeValueCompletion } from "../../../api";
import { allowedTargets, UI5AttributeValueCompletionOptions } from "./index";

export interface CompletionItem {
  name: string;
  text: string;
  commitCharacters: string[];
  commitCharacterRequired: boolean;
  // documentation: { kind: MarkupKind.Markdown, value: documentation.join('\n') }
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
    const control = element.name ?? "";
    const mainServicePath = context.manifest?.mainServicePath;
    const service = mainServicePath
      ? context.services[mainServicePath]
      : undefined;
    if (!service) {
      return [];
    }
    const metadata = service.convertedMetadata;
    const allowedTerms = getAllowedAnnotationsTermsForControl(control);
    const isPropertyPath = isPropertyPathAllowed(control);
    const completionItems: string[] = [];
    const segments = (attribute.value || "").split("/");
    const precedingSegments = (prefix || "").split("/");
    const completionSegmentIndex = precedingSegments.length - 1;
    precedingSegments.pop();
    const completionSegmentOffset =
      precedingSegments.join("/").length + (precedingSegments.length ? 1 : 0);
    const isAbsolutePath = segments.length && !segments[0];
    if (!isAbsolutePath && completionSegmentIndex > 0) {
      // relative paths are not supported
      return [];
    }

    if (completionSegmentIndex < 2) {
      // completion for root element
      const roots = getRootElements(
        metadata,
        allowedTerms,
        allowedTargets,
        isPropertyPath
      );
      const texts = roots.map(
        (root) =>
          `${completionSegmentIndex === 0 ? "/" : ""}${
            root._type === "EntityContainer"
              ? root.fullyQualifiedName
              : root.name
          }`
      );
      completionItems.push(...new Set(texts).values()); // removes duplicates
    } else {
      // completion for (navigation) property segment
      const precedingPath = segments.slice(0, completionSegmentIndex).join("/");
      const { target, isCollection } = resolvePathTarget(
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
        const possibleTargets = getNextPossiblePathTargets(
          service.convertedMetadata,
          target,
          true,
          {
            allowedTerms,
            allowedTargets,
            isPropertyPath,
            isCollection: isCollection ? false : undefined,
          },
          [target.fullyQualifiedName]
        );
        completionItems.push(
          ...possibleTargets.map((target) => {
            return `${target.name}`;
          })
        );
      }
    }

    // Calculate completion range considering that value region includes quotes
    const completionSegmentStart =
      (attribute.syntax.value?.startColumn ?? 0) + 1 + completionSegmentOffset;
    const completionSegmentEnd = (attribute.syntax.value?.endColumn ?? 2) - 1;

    return completionItems.map((item) => {
      return {
        type: "AnnotationTargetInXMLAttributeValue",
        astNode: {
          ...attribute,
          syntax: {
            ...attribute.syntax,
            value: {
              ...attribute.syntax.value,
              startColumn: completionSegmentStart,
              endColumn: completionSegmentEnd,
            },
          },
        },
        ui5Node: {
          kind: "AnnotationTarget",
          name: item,
          value: item,
        },
      } as AnnotationTargetInXMLAttributeValueCompletion;
    });
  }
  return [];
}
