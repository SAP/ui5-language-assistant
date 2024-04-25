import { getUI5PropertyByXMLAttributeKey } from "@ui5-language-assistant/logic-utils";
import {
  collectAnnotationsForElement,
  getPathConstraintsForControl,
  getElementAttributeValue,
  getNextPossiblePathTargets,
  resolvePathTarget,
  normalizePath,
  ResolvedPathTargetType,
  resolveContextPath,
} from "../../../utils";

import type { UI5AttributeValueCompletionOptions } from "./index";
import type {
  EntitySet,
  Singleton,
  EntityType,
  NavigationProperty,
  Property,
} from "@sap-ux/vocabularies-types";
import {
  AnnotationPathInXMLAttributeValueCompletion,
  ContextPathOrigin,
  SAP_FE_MACROS,
} from "../../../types";
import { Range } from "vscode-languageserver-types";
import { getAffectedRange } from "../utils";
import {
  AnnotationPathInXMLAttributeValueTypeName,
  AnnotationTargetInXMLAttributeValueTypeName,
  MetaPathSuggestion,
  PropertyPathInXMLAttributeValueTypeName,
} from "../../../types/completion";
import {
  getRootElementSuggestions,
  sortMap,
  suggestionToTargetCompletion,
} from "./utils";

export interface CompletionItem {
  name: string;
  text: string;
  commitCharacters: string[];
  commitCharacterRequired: boolean;
}

/**
 * Suggests values for macros metaPath
 */
export function metaPathSuggestions({
  element,
  attribute,
  context,
  prefix,
}: UI5AttributeValueCompletionOptions): MetaPathSuggestion[] {
  const result: MetaPathSuggestion[] = [];
  const ui5Property = getUI5PropertyByXMLAttributeKey(
    attribute,
    context.ui5Model
  );

  if (
    !(ui5Property?.library === SAP_FE_MACROS && ui5Property.name === "metaPath")
  ) {
    return [];
  }
  const contextPathAttr = getElementAttributeValue(element, "contextPath");

  const mainServicePath = context.manifestDetails.mainServicePath;
  const service = mainServicePath
    ? context.services[mainServicePath]
    : undefined;
  if (!service) {
    return [];
  }

  const metadata = service.convertedMetadata;
  let baseType: EntityType | undefined;
  let base: ResolvedPathTargetType | undefined;
  // navigation is only allowed when contextPath in xml attribute is undefined
  const isNavSegmentsAllowed = typeof contextPathAttr === "undefined";
  const segments = (attribute.value || "").split("/");
  const precedingSegments = (prefix || "").split("/");
  const completionSegmentIndex = precedingSegments.length - 1;
  precedingSegments.pop();
  const completionSegmentOffset =
    precedingSegments.join("/").length + (precedingSegments.length ? 1 : 0);
  const isAbsolutePath = segments.length > 1 && !segments[0];
  const { expectedAnnotations, expectedTypes } = getPathConstraintsForControl(
    element.name,
    ui5Property
  );
  if (expectedAnnotations.length + expectedTypes.length === 0) {
    return [];
  }
  const precedingPath = segments.slice(0, completionSegmentIndex).join("/");

  const isPropertiesAllowed = expectedTypes.includes("Property");

  // no CC if contextPath is defined in xml and CC is request after absolute path e.g `/`
  if (contextPathAttr && isAbsolutePath && completionSegmentIndex === 1) {
    return [];
  }
  const resolvedContext = resolveContextPath(
    context,
    element,
    isAbsolutePath,
    precedingPath
  );

  if (
    (!contextPathAttr && isAbsolutePath && completionSegmentIndex === 1) ||
    !resolvedContext
  ) {
    // for first absolute segment e.g /
    const suggestions = getRootElementSuggestions(
      metadata,
      expectedAnnotations,
      expectedTypes,
      isPropertiesAllowed
    );
    const targetSuggestion = suggestionToTargetCompletion(
      attribute,
      suggestions,
      completionSegmentIndex,
      completionSegmentOffset
    );
    return targetSuggestion;
  }
  const { contextPath, origin } = resolvedContext;
  if (origin === ContextPathOrigin.entitySetInManifest) {
    base = service.convertedMetadata.entitySets.find(
      (e) => `/${e.name}` === contextPath
    );
    baseType = base?.entityType;
  }
  let isCollection;

  // for (navigation) property segment or annotation term
  if (!isAbsolutePath && completionSegmentIndex > 0) {
    const contextToConsider = [contextPath, precedingPath].join("/");

    if (!isNavSegmentsAllowed) {
      return [];
    }

    ({
      target: base,
      targetStructuredType: baseType,
      isCollection: isCollection,
    } = resolvePathTarget(metadata, contextToConsider, baseType));
    if (!base) {
      // target not resolved e.g. for wrong nav segment - no further segments possible
      return [];
    }
  }

  if (!base) {
    ({
      target: base,
      targetStructuredType: baseType,
      isCollection: isCollection,
    } = resolvePathTarget(metadata, normalizePath(contextPath)));
  }

  if (!base) {
    // target not resolved - no further segments possible
    return [];
  }

  if (base._type === "Property") {
    // no further segments possible after entity property
    return [];
  }

  // Calculate completion range considering that value region includes quotes
  const affectedRange: Range | undefined = getAffectedRange(
    attribute.syntax.value,
    completionSegmentOffset
  );

  let possibleTargets: (
    | EntitySet
    | Singleton
    | NavigationProperty
    | Property
  )[] = [];

  // collect existing terms
  const annotationList = collectAnnotationsForElement(
    expectedAnnotations,
    base
  );
  if (["EntitySet", "Singleton"].includes(base._type)) {
    // for first path segment completion, where current base can be entity set or singleton,
    // we collect also terms applied on their structural entity type

    // targetStructuredType is never undefined in this context
    annotationList.push(
      ...collectAnnotationsForElement(expectedAnnotations, baseType)
    );
  }
  result.push(
    ...annotationList.map((annotation) => {
      const fullPath = `@${
        annotation.qualifier
          ? `${annotation.term}#${annotation.qualifier}`
          : annotation.term
      }`;
      return {
        type: AnnotationPathInXMLAttributeValueTypeName,
        node: {
          kind: "Term",
          name: fullPath,
          text: fullPath,
          affectedRange,
        },
      } as AnnotationPathInXMLAttributeValueCompletion;
    })
  );

  // collect possible properties or navigation segments
  possibleTargets = getNextPossiblePathTargets(
    service.convertedMetadata,
    base,
    false,
    {
      allowedTerms: expectedAnnotations,
      allowedTargets: expectedTypes,
      isPropertyPath: isPropertiesAllowed,
      isCollection: isCollection ? false : undefined,
    },
    [base.fullyQualifiedName]
  );
  if (!isNavSegmentsAllowed) {
    // filter out Property
    possibleTargets = possibleTargets.filter((i) => i._type === "Property");
  }
  result.push(
    ...convertTargetsToCompletionItems(
      possibleTargets,
      isPropertiesAllowed,
      base._type === "EntityContainer",
      affectedRange
    )
  );

  // only if contextPath is not defined in xml and CC is request for initial segment
  if (!contextPathAttr && completionSegmentIndex === 0) {
    const suggestions = getRootElementSuggestions(
      metadata,
      expectedAnnotations,
      expectedTypes,
      isPropertiesAllowed
    );
    const targetSuggestion = suggestionToTargetCompletion(
      attribute,
      suggestions,
      completionSegmentIndex,
      completionSegmentOffset
    );
    result.push(...targetSuggestion);
  }
  return result;
}

function convertTargetsToCompletionItems(
  targets: (EntitySet | Singleton | Property | NavigationProperty)[],
  isPropertyPath: boolean,
  isEntityContainer: boolean,
  affectedRange: Range | undefined
): MetaPathSuggestion[] {
  return targets.map((t) => {
    let type = PropertyPathInXMLAttributeValueTypeName;
    if (!isPropertyPath) {
      type = AnnotationPathInXMLAttributeValueTypeName;
    }
    if (isEntityContainer) {
      type = AnnotationTargetInXMLAttributeValueTypeName;
    }
    return {
      type,
      node: {
        kind: t._type,
        name: t.name,
        text: t.name,
        affectedRange,
        commitCharacters: ["/"],
        sortText: sortMap[t._type] + t.name,
      },
    } as MetaPathSuggestion;
  });
}
