import { AnnotationTerm, specification } from "./spec";

export function isPropertyPathAllowed(control: string): boolean {
  return ["Field", "FormElement"].includes(control);
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
