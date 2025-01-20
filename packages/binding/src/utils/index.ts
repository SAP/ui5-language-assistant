import type {
  UI5Aggregation,
  UI5Type,
} from "@ui5-language-assistant/semantic-model-types";

export {
  typesToValue,
  valueTypeMap,
  isParts,
  isAnyType,
  findRange,
  defaultRange,
  getPropertyTypeWithPossibleValue,
  isMacrosMetaContextPath,
} from "./element";

export { getCursorContext } from "./cursor";

export { getLogger } from "./logger";

export { getDocumentation } from "./documentation";

export const getAltTypesPrime = (
  aggregation?: UI5Aggregation
): UI5Type | undefined =>
  aggregation?.altTypes?.find((i) => i.kind === "PrimitiveType");

export {
  getReference,
  buildType,
  getPossibleValuesForClass,
  getConstructorParameterProperties,
  getPossibleElement,
} from "./definition";
