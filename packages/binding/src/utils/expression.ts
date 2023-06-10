import {
  rangeContained,
  PropertyBindingInfoTypes as BindingTypes,
} from "@ui5-language-assistant/binding-parser";
import { ExtractBindingExpression } from "..//types";

/**
 * Syntax of a binding expression can be represented by `{=expression}` or `{:=expression}`
 * If an input text starts with either `{=` or `{:=`, input text is considered as binding expression
 */
export const isBindingExpression = (input: string): boolean => {
  input = input.trim();
  return /^{(=|:=)/.test(input);
};

export const filterLexerError = (
  binding: BindingTypes.StructureValue,
  errors: {
    lexer: BindingTypes.LexerError[];
    parse: BindingTypes.ParseError[];
  }
): BindingTypes.LexerError[] => {
  const result: BindingTypes.LexerError[] = [];
  const lexErr = errors.lexer.filter(
    (item) => binding.range && rangeContained(binding.range, item.range)
  );
  result.push(...lexErr);

  return result;
};
export const filterParseError = (
  binding: BindingTypes.StructureValue,
  errors: {
    lexer: BindingTypes.LexerError[];
    parse: BindingTypes.ParseError[];
  }
): BindingTypes.ParseError[] => {
  const result: BindingTypes.ParseError[] = [];

  const parseErr = errors.parse.filter(
    (item) => binding.range && rangeContained(binding.range, item.range)
  );
  result.push(...parseErr);

  return result;
};

/**
 * An input is considered property binding syntax when
 *
 * a. is empty curly bracket e.g  `{}` or `{   }`
 *
 * b. has starting and closing curly bracket and key property with colon e.g `{anyKey: }` or `{"anyKey":}` or `{'anyKey':}`
 *
 * c. empty string [for initial code completion snippet]
 */
export const isPropertyBindingInfo = (
  input: string,
  binding?: BindingTypes.StructureValue
): boolean => {
  // check empty string
  if (input.trim().length === 0) {
    return true;
  }

  if (!binding) {
    return false;
  }

  // check empty curly brackets
  if (
    binding.leftCurly &&
    binding.leftCurly.text &&
    binding.elements.length === 0
  ) {
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

/**
 * Regular expression to extract binding syntax.
 *
 * Also handles escaping of '{' and '}'.
 */
// eslint-disable-next-line no-useless-escape
const start = /(\\[\\\{\}])|(\{)/g;
// eslint-disable-next-line no-useless-escape
const end = /(\\[\\\{\}])|(\})/g;

export const extractBindingExpression = (
  input: string
): ExtractBindingExpression[] => {
  const result: ExtractBindingExpression[] = [];
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
