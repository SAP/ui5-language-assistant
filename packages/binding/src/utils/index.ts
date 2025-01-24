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

/**
 * Finds and returns the first alternative type in the aggregation's altTypes array
 * that has a kind property equal to "PrimitiveType".
 *
 * @param {UI5Aggregation} [aggregation] - The aggregation object which may contain alternative types.
 * @returns {UI5Type | undefined} - The first alternative type with kind "PrimitiveType", or undefined if not found.
 */
export const findPrimitiveTypeInAggregation = (
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
