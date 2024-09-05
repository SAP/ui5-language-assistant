import { UI5Prop } from "@ui5-language-assistant/semantic-model-types";
import { Context } from "@ui5-language-assistant/context";
import { XMLElement } from "@xml-tools/ast";
import i18next, { TFunction } from "i18next";
import {
  ContextPathOrigin,
  type AnnotationTerm,
  type ResolveContextPath,
} from "../types";
import { AllowedTargetType } from "./metadata";
import {
  BuildingBlockPathConstraints,
  fullyQualifiedNameToTerm,
  specification,
} from "./spec";

export type AttributeValueType = string | null | undefined;

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
): AttributeValueType {
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
 * Returns context path for completion and diagnostics services. Context path defined in xml attribute wins over
 * context path defined in manifest.json file.
 *
 * @param attributeValue - current element contextPath attribute value
 * @param context - global context object
 * @returns - context path
 */
export function getContextPath(
  attributeValue: AttributeValueType,
  context: Context
): AttributeValueType {
  const contextPathInManifest: string | undefined =
    getManifestContextPath(context);
  return typeof attributeValue !== "undefined"
    ? attributeValue
    : contextPathInManifest || undefined;
}

/**
 * Get context path defined in manifest.json file.
 *
 * @param context
 * @returns
 */
export function getManifestContextPath(context: Context): string | undefined {
  return context.manifestDetails?.customViews?.[context.customViewId || ""]
    ?.contextPath;
}

/**
 * Resolve context path. Context path can be defined
 * - as xml attribute
 * - as contextPath in manifest.json file
 * - in meta path if path is starting as absolute
 * - as entity set of view defined in manifest.json file
 *
 * @param context context
 * @param element xml element
 * @param isAbsolutePath path started as absolute
 * @param precedingPath proceeding path segment
 * @returns context path with its origin
 */
export function resolveContextPath(
  context: Context,
  element: XMLElement,
  isAbsolutePath: boolean,
  precedingPath: string
): ResolveContextPath | undefined {
  const contextPathAttr = getElementAttributeValue(element, "contextPath");
  if (contextPathAttr) {
    return {
      contextPath: contextPathAttr,
      origin: ContextPathOrigin.xmlAttributeInContextPath,
    };
  }

  // if not absolute path and context path is not defined in xml, take it from manifest.json
  const contextPath = getManifestContextPath(context);
  if (!isAbsolutePath && contextPath) {
    return {
      contextPath,
      origin: ContextPathOrigin.contextPathInManifest,
    };
  }

  // context path is preceding path if it started as absolute path
  if (isAbsolutePath && precedingPath.length > 0) {
    return {
      contextPath: precedingPath,
      origin: ContextPathOrigin.xmlAttributeInMetaPath,
    };
  }

  const entitySet =
    context.manifestDetails.customViews[context.customViewId || ""]
      ?.entitySet ?? "";

  if (entitySet) {
    // context path is entity set
    return {
      contextPath: `/${entitySet}`,
      origin: ContextPathOrigin.entitySetInManifest,
    };
  }
}
