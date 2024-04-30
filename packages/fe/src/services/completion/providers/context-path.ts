import { getUI5PropertyByXMLAttributeKey } from "@ui5-language-assistant/logic-utils";
import { getPathConstraintsForControl } from "../../../utils";
import {
  AnnotationTargetInXMLAttributeValueCompletion,
  SAP_FE_MACROS,
} from "../../../types";

import { UI5AttributeValueCompletionOptions } from "./index";
import { CompletionSuggestion } from "../../../types/completion";
import {
  getNavigationSuggestion,
  getRootElementSuggestions,
  suggestionToTargetCompletion,
} from "./utils";

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
  if (!ui5Property) {
    return [];
  }
  const metaPathStartsWithAbsolutePath = element.attributes.find(
    (i) => i.key === "metaPath" && i.value?.startsWith("/")
  );
  // no CC for contextPath if metaPath starts with absolute path
  if (metaPathStartsWithAbsolutePath) {
    return [];
  }

  if (
    !["contextPath"].includes(ui5Property.name) ||
    ui5Property?.library !== SAP_FE_MACROS ||
    ui5Property.parent?.name !== "Chart"
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
  const metadata = service.convertedMetadata;
  const { expectedAnnotations, expectedTypes } = getPathConstraintsForControl(
    element.name,
    ui5Property
  );
  if (expectedAnnotations.length + expectedTypes.length === 0) {
    return [];
  }
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

  if (completionSegmentIndex < 2) {
    // completion for root element
    suggestions.push(
      ...getRootElementSuggestions(
        metadata,
        expectedAnnotations,
        expectedTypes,
        isPropertyPath
      )
    );
  } else {
    // completion for navigation property segment
    const precedingPath = segments.slice(0, completionSegmentIndex).join("/");
    const options = {
      allowedTerms: expectedAnnotations,
      allowedTargets: expectedTypes,
      isPropertyPath,
    };
    suggestions.push(
      ...getNavigationSuggestion(
        service.convertedMetadata,
        precedingPath,
        options
      )
    );
  }
  return suggestionToTargetCompletion(
    attribute,
    suggestions,
    completionSegmentIndex,
    completionSegmentOffset
  );
}
