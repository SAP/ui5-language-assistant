import { UI5Prop } from "@ui5-language-assistant/semantic-model-types";
import { Context } from "@ui5-language-assistant/context";
import { XMLElement } from "@xml-tools/ast";
import i18next, { TFunction } from "i18next";
import type { AnnotationTerm } from "../types";
import { AllowedTargetType } from "./metadata";
import {
  BuildingBlockPathConstraints,
  fullyQualifiedNameToTerm,
  specification,
} from "./spec";

export function isPropertyPathAllowed(control: string | null): boolean {
  return ["Field", "FormElement"].includes(control || "");
}

export function getPathConstraintsForControl(
  controlName: string | null,
  property: UI5Prop
): {
  expectedAnnotations: AnnotationTerm[];
  expectedTypes: AllowedTargetType[];
} {
  const spec: BuildingBlockPathConstraints | undefined =
    specification[controlName || ""];
  if (property.metadata) {
    return {
      expectedAnnotations: property.metadata.expectedAnnotations.map(
        (fullyQualifiedName) => {
          return fullyQualifiedNameToTerm(fullyQualifiedName);
        }
      ),
      expectedTypes: property.metadata.expectedTypes as AllowedTargetType[],
    };
  } else if (spec) {
    // fallback to hardcoded specification
    return {
      expectedAnnotations:
        spec.constraints[property.name]?.allowedAnnotations || [],
      expectedTypes: spec.constraints[property.name]?.allowedTargets || [],
    };
  }
  return { expectedAnnotations: [], expectedTypes: [] };
}

export function getElementAttributeValue(
  element: XMLElement,
  attributeName: string
): string | null | undefined {
  return element.attributes.find((attribute) => attribute.key === attributeName)
    ?.value;
}

// truncates trailing slash from path
export function normalizePath(path: string): string {
  const re = new RegExp(/[\w/]*\w+\/$/);
  if (path.match(re)) {
    return path.slice(0, path.length - 1);
  }
  return path;
}

export const adaptTranslatedText = (text: string): string => {
  return text.replace(/&#x2F;/g, "/");
};

export const t: TFunction = (key: string, ...args) => {
  const result = i18next.t(key, ...args);
  return adaptTranslatedText(result as string);
};

/**
 * Returns context path for completion and diagnostics services
 * @param attributeValue - current element contextPath attribute value
 * @param context - global context object
 * @returns - context path
 */
export function getContextPath(
  attributeValue: string | null | undefined,
  context: Context
): string | null | undefined {
  const contextPathInManifest: string | undefined =
    context.manifestDetails?.customViews?.[context.customViewId || ""]
      ?.contextPath;
  return typeof attributeValue !== "undefined"
    ? attributeValue
    : contextPathInManifest || undefined;
}
