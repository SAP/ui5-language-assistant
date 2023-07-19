import type {
  ParseResultErrors,
  StructureValue,
} from "../types/binding-parser";
import { isAfterAdjacentRange, isBeforeAdjacentRange } from "./position";

/**
 * Syntax of a binding expression can be represented by `{=expression}` or `{:=expression}`
 * If an input text starts with either `{=` or `{:=`, input text is considered as binding expression
 */
export const isBindingExpression = (input: string): boolean => {
  input = input.trim();
  return /^{(=|:=)/.test(input);
};

/**
 * Check model
 *
 * It is considered as model when it contains `>` or `>/` after first key e.g oData> or oData>/...
 */
export const isModel = (
  binding: StructureValue,
  errors?: ParseResultErrors
): boolean => {
  if (!errors) {
    return false;
  }
  const modelSign = errors.lexer.find(
    (i) => i.type === "special-chars" && [">", ">/"].includes(i.text)
  );
  if (!modelSign) {
    return false;
  }
  // check model should appears after first key
  if (isBeforeAdjacentRange(binding.elements[0]?.key?.range, modelSign.range)) {
    return true;
  }
  return false;
};

/**
 * Check metadata path
 *
 * It is considered metadata path when it is `/` as separator and
 *
 * a. is before first key e.g /key
 *
 * b. is after first key e.g. key/
 */
export const isMetadataPath = (
  binding: StructureValue,
  errors?: ParseResultErrors
): boolean => {
  if (!errors) {
    return false;
  }
  const metadataSeparator = errors.lexer.find(
    (i) => i.type === "special-chars" && i.text.startsWith("/")
  );
  if (!metadataSeparator) {
    return false;
  }
  // check metadata separator is before first key e.g /key
  if (
    binding.elements[0]?.key?.range.start &&
    isBeforeAdjacentRange(
      metadataSeparator.range,
      binding.elements[0].key.range
    )
  ) {
    return true;
  }
  // check metadata separator is after first key e.g. key/
  if (
    isAfterAdjacentRange(
      metadataSeparator.range,
      binding.elements[0]?.key?.range
    )
  ) {
    return true;
  }
  return false;
};

/**
 * An input is considered property binding syntax when
 *
 * a. is empty curly bracket e.g  `{}` or `{   }`
 *
 * b. has starting or closing curly bracket and key property with colon e.g `{anyKey: }` or `{"anyKey":}` or `{'anyKey':}`
 *
 * c. empty string [for initial code completion snippet]
 *
 * d. is not model e.g {i18n>...} or {oData>...}
 *
 * e. is not OData path e.g {/path/to/...} or {path/to/...}
 */
export const isPropertyBindingInfo = (
  input: string,
  binding?: StructureValue,
  errors?: ParseResultErrors
): boolean => {
  // check empty string
  if (input.trim().length === 0) {
    return true;
  }

  if (!binding) {
    return false;
  }

  // check if model
  if (isModel(binding, errors)) {
    return false;
  }

  // check if metadata path
  if (isMetadataPath(binding, errors)) {
    return false;
  }

  if (
    binding.leftCurly &&
    binding.leftCurly.text &&
    binding.elements.length === 0
  ) {
    // check empty curly brackets
    return true;
  }
  // check it has at least one key with colon
  const result = binding.elements.find(
    /* istanbul ignore next */
    (item) => item.key?.text && item.colon?.text
  );
  if (result && binding.leftCurly && binding.leftCurly.text) {
    return true;
  }
  return false;
};
