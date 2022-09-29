import { AnnotationTerm, specification } from "./spec";

export function getAllowedAnnotationsTermsForControl(
  controlName: string
): AnnotationTerm[] {
  const spec = specification[controlName];
  if (spec) {
    return spec.allowedAnnotations;
  }
  return [];
}
