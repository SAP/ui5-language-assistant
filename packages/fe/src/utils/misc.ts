import { UI5Prop } from "@ui5-language-assistant/semantic-model-types";
import { XMLElement } from "@xml-tools/ast";
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
