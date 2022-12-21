import { getUI5PropertyByXMLAttributeKey } from "@ui5-language-assistant/logic-utils";
import {
  collectAnnotationsForElement,
  getPathConstraintsForControl,
  getElementAttributeValue,
  getNextPossiblePathTargets,
  resolvePathTarget,
  normalizePath,
} from "../../../utils";

import type { UI5AttributeValueCompletionOptions } from "./index";
import type {
  EntityContainer,
  EntitySet,
  Singleton,
  EntityType,
  NavigationProperty,
  Property,
} from "@sap-ux/vocabularies-types";
import type {
  AnnotationPathInXMLAttributeValueCompletion,
  PropertyPathInXMLAttributeValueCompletion,
} from "../../../types";
import { Range } from "vscode-languageserver-types";
import { getAffectedRange } from "../utils";

export interface CompletionItem {
  name: string;
  text: string;
  commitCharacters: string[];
  commitCharacterRequired: boolean;
  // documentation: { kind: MarkupKind.Markdown, value: documentation.join('\n') }
}

/**
 * Suggests values for macros metaPath
 */
export function metaPathSuggestions({
  element,
  attribute,
  context,
  prefix,
}: UI5AttributeValueCompletionOptions): (
  | AnnotationPathInXMLAttributeValueCompletion
  | PropertyPathInXMLAttributeValueCompletion
)[] {
  const result: (
    | AnnotationPathInXMLAttributeValueCompletion
    | PropertyPathInXMLAttributeValueCompletion
  )[] = [];
  const ui5Property = getUI5PropertyByXMLAttributeKey(
    attribute,
    context.ui5Model
  );

  if (
    !(
      ui5Property?.library === "sap.fe.macros" &&
      ui5Property.name === "metaPath"
    )
  ) {
    return [];
  }
  // let annotationList: AnnotationLookupResultEntry[] | undefined;
  let contextPath = getElementAttributeValue(element, "contextPath");
  const mainServicePath = context.manifestDetails?.mainServicePath;
  const service = mainServicePath
    ? context.services[mainServicePath]
    : undefined;
  if (!service) {
    return [];
  }

  const entitySet =
    (context.manifestDetails.customViews || {})[context.customViewId || ""]
      ?.entitySet ?? "";
  const metadata = service.convertedMetadata;
  let baseType: EntityType | undefined;
  let base:
    | EntityContainer
    | EntitySet
    | EntityType
    | Singleton
    | Property
    | undefined;
  let isNavSegmentsAllowed = true;

  if (typeof contextPath === "string") {
    if (!contextPath.startsWith("/")) {
      return [];
    }
    ({ target: base, targetStructuredType: baseType } = resolvePathTarget(
      metadata,
      normalizePath(contextPath)
    ));
    isNavSegmentsAllowed = false;
  } else {
    contextPath = `/${entitySet}`;
    base = service.convertedMetadata.entitySets.find(
      (e) => e.name === entitySet
    );
    baseType = base?.entityType;
  }

  if (baseType) {
    const { expectedAnnotations, expectedTypes } = getPathConstraintsForControl(
      element.name,
      ui5Property
    );
    const isPropertiesAllowed = expectedTypes.includes("Property");
    const segments = (attribute.value || "").split("/");
    const precedingSegments = (prefix || "").split("/");
    const completionSegmentIndex = precedingSegments.length - 1;
    precedingSegments.pop();
    const completionSegmentOffset =
      precedingSegments.join("/").length + (precedingSegments.length ? 1 : 0);
    const isAbsolutePath = segments.length > 1 && !segments[0];

    if (isAbsolutePath && completionSegmentIndex > 0) {
      // absolute paths are not supported in metaPath
      return [];
    }
    if (!isNavSegmentsAllowed && completionSegmentIndex > 0) {
      return [];
    }
    if (expectedAnnotations.length + expectedTypes.length === 0) {
      return [];
    }

    // completion for (navigation) property segment or annotation term
    const precedingPath = segments.slice(0, completionSegmentIndex).join("/");
    const { target, isCollection, targetStructuredType } =
      completionSegmentIndex === 0
        ? {
            target: base,
            targetStructuredType: baseType,
            isCollection: undefined,
          }
        : resolvePathTarget(service.convertedMetadata, precedingPath, baseType);
    if (!target) {
      // target not resolved - no further segments possible
      return [];
    } else if (isPropertiesAllowed && target._type === "Property") {
      // no further segments possible after entity property
      return [];
    } else {
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
      if (target._type === "Property" || target._type === "EntityContainer") {
        return [];
      }
      // collect existing terms
      const annotationList = collectAnnotationsForElement(
        expectedAnnotations,
        target
      );
      if (["EntitySet", "Singleton"].includes(target._type)) {
        // for first path segment completion, where current base can be entity set or singleton,
        // we collect also terms applied on their structural entity type

        // targetStructuredType is never undefined in this context
        annotationList.push(
          ...collectAnnotationsForElement(
            expectedAnnotations,
            targetStructuredType
          )
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
            type: "AnnotationPathInXMLAttributeValue",
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
        target,
        false,
        {
          allowedTerms: expectedAnnotations,
          allowedTargets: expectedTypes,
          isPropertyPath: isPropertiesAllowed,
          isCollection: isCollection ? false : undefined,
        },
        [target.fullyQualifiedName]
      );

      result.push(
        ...convertTargetsToCompletionItems(
          possibleTargets,
          isNavSegmentsAllowed,
          isPropertiesAllowed,
          affectedRange
        )
      );
    }
  }
  return result;
}

function convertTargetsToCompletionItems(
  targets: (EntitySet | Singleton | Property | NavigationProperty)[],
  isNavSegmentsAllowed: boolean,
  isPropertyPath: boolean,
  affectedRange: Range | undefined
): (
  | AnnotationPathInXMLAttributeValueCompletion
  | PropertyPathInXMLAttributeValueCompletion
)[] {
  const applicableTargets: (NavigationProperty | Property)[] = targets.reduce(
    (acc, t) => {
      if (
        t._type === "Property" ||
        (isNavSegmentsAllowed && t._type === "NavigationProperty")
      ) {
        acc.push(t);
      }
      return acc;
    },
    [] as (NavigationProperty | Property)[]
  );

  return applicableTargets.map((t) => {
    if (t._type === "Property") {
      return {
        type: "PropertyPathInXMLAttributeValue",
        node: {
          kind: t._type,
          name: t.name,
          text: t.name,
          affectedRange,
          sortText: "A" + t.name,
        },
      } as PropertyPathInXMLAttributeValueCompletion;
    } else {
      return {
        type: isPropertyPath
          ? "PropertyPathInXMLAttributeValue"
          : "AnnotationPathInXMLAttributeValue",
        node: {
          kind: t._type,
          name: t.name,
          text: t.name,
          affectedRange,
          commitCharacters: ["/"],
          sortText: "B" + t.name,
        },
      } as AnnotationPathInXMLAttributeValueCompletion;
    }
  });
}
