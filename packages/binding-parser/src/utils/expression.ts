import { isPrimitiveValue } from "../api";
import { ExtractBindingSyntax } from "../types";
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
 * It is considered as model when it starts with `>` or its HTML equivalent after first key without any quotes e.g oData> or oData>/...
 */
export const isModel = (
  binding: StructureValue,
  errors?: ParseResultErrors
): boolean => {
  if (!errors) {
    return false;
  }
  const modelSign = errors.lexer.find(
    (i) =>
      i.type === "special-chars" &&
      (i.text.startsWith(">") || i.text.startsWith("&gt;"))
  );
  if (!modelSign) {
    return false;
  }
  // check model should appears after first key without quotes
  if (
    binding.elements[0]?.key?.originalText === binding.elements[0]?.key?.text &&
    isBeforeAdjacentRange(binding.elements[0]?.key?.range, modelSign.range)
  ) {
    return true;
  }
  return false;
};

/**
 * Check metadata path
 *
 * It is considered metadata path when it is `/` or its HTML equivalent as separator and
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
    (i) =>
      i.type === "special-chars" &&
      (i.text.startsWith("/") ||
        i.text.startsWith("&#47;") ||
        i.text.startsWith("&#x2F;"))
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
 * An input is considered as an allowed binding when
 *
 * a. is empty curly bracket e.g  `{}` or `{   }`
 *
 * b. has starting or closing curly bracket and known properties with colon e.g `{anyKey: }` or `{"anyKey":}` or `{'anyKey':}`
 *
 * c. empty string [for initial code completion snippet]
 *
 * d. is not model e.g {i18n>...} or {oData>...}
 *
 * e. is not OData path e.g {/path/to/...} or {path/to/...}
 */
export const isBindingAllowed = (
  input: string,
  binding: StructureValue,
  errors: ParseResultErrors,
  properties: string[]
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
  // check if `ui5object` has a truthy value.
  const ui5Obj = binding.elements.find((i) => i.key?.text === "ui5object");
  if (ui5Obj && isPrimitiveValue(ui5Obj.value)) {
    // if truthy value [not false value], it is not a binding expression
    if (!["null", `''`, `""`, "0", "false"].includes(ui5Obj.value.text)) {
      return false;
    }
  }
  // check if only `ui5object` - show code completion
  if (ui5Obj && binding.elements.length === 1) {
    return true;
  }
  // check it has at least one key with colon
  const result = binding.elements.find(
    /* istanbul ignore next */
    (item) => properties.find((p) => p === item.key?.text) && item.colon?.text
  );
  if (result && binding.leftCurly && binding.leftCurly.text) {
    return true;
  }
  return false;
};

/**
 * Regular expression to extract binding syntax.
 *
 * Also handles escaping of '{' and '}'.
 */
// eslint-disable-next-line no-useless-escape
const start = /(\\[\\\{\}])|(\{)/g;
// eslint-disable-next-line no-useless-escape
const end = /(\\[\\\{\}])|(\})/g;

export const extractBindingSyntax = (input: string): ExtractBindingSyntax[] => {
  const result: ExtractBindingSyntax[] = [];
  let startRegResult: RegExpExecArray | null;
  let endRegResult: RegExpExecArray | null;
  // resetting
  start.lastIndex = 0;
  let startIndex = 0;
  let lastIndex = 0;
  let endIndex = 0;
  const text = input;
  if (text.trim() === "") {
    return [{ startIndex, endIndex, expression: input }];
  }
  while ((startRegResult = start.exec(input)) !== null) {
    // scape special chars
    if (startRegResult[1]) {
      continue;
    }
    const startInput = input.slice(startRegResult.index);
    // collect all closing bracket(s)
    end.lastIndex = 0;
    while ((endRegResult = end.exec(startInput)) !== null) {
      // scape special chars
      if (endRegResult[1]) {
        break;
      }
      lastIndex = endRegResult.index;
    }
    if (lastIndex === startRegResult.index) {
      // missing closing bracket
      const expression = startInput.slice(0, input.length);
      result.push({
        startIndex: startRegResult.index,
        endIndex: input.length,
        expression,
      });
      input = startInput.slice(input.length);
    } else {
      const expression = startInput.slice(0, lastIndex + 1);
      startIndex = endIndex + startRegResult.index;
      endIndex = startIndex + lastIndex + 1;
      result.push({
        startIndex,
        endIndex,
        expression,
      });
      input = startInput.slice(lastIndex + 1);
      // resetting
      start.lastIndex = 0;
    }
  }
  return result;
};
