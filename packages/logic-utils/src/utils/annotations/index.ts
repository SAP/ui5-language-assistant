export {
  specification,
  AnnotationTerm,
  fullyQualifiedNameToTerm,
} from "./spec";
export {
  getAllowedAnnotationsTermsForControl,
  isPropertyPathAllowed,
} from "./misc";
export { getElementAttributeValue, getRootElement } from "./xml-utils";
export {
  AllowedTargetType,
  collectAnnotationsForElement,
  getEntityTypeForElement,
  getRootElements,
} from "./metadata";
export {
  resolvePathTarget,
  getNextPossiblePathTargets,
  ResolvedPathTargetType,
} from "./path";
