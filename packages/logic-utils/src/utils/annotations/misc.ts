import { XMLElement } from "@xml-tools/ast";
import { getRootElement } from "./xml-utils";
import { AnnotationTerm, specification } from "./spec";
import { AppContext } from "@ui5-language-assistant/semantic-model-types";

export function getEntitySetFromController(
  element: XMLElement,
  context: AppContext
): string | undefined {
  let result: string | undefined;
  // TODO: use app.id and relative path as view name
  const manifest = context.manifest;
  const controllerName = getRootElement(element).attributes.find(
    (attribute) => attribute.key === "controllerName"
  )?.value;
  if (controllerName) {
    result = manifest?.customViews?.[controllerName]?.entitySet;
  }
  return result;
}

export function getAllowedAnnotationsTermsForControl(
  controlName: string
): AnnotationTerm[] {
  const spec = specification[controlName];
  if (spec) {
    return spec.allowedAnnotations;
  }
  return [];
}
