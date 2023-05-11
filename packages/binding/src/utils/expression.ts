import { ExtractBindingExpression } from "..//types";

/**
 * Syntax of a binding expression can be represented by `{=expression}` or `{:=expression}`
 * If an input text starts with either `{=` or `{:=`, input text is considered as binding expression
 */
export const isBindingExpression = (input: string): boolean => {
  input = input.trim();
  return /^{(=|:=)/.test(input);
};

/**
 * Regular expression to check if an input is property binding syntax
 */
const propBindingSyntax = /\s*('|"|)[a-zA-Z$_][a-zA-Z0-9$_]*\1\s*:/;

/**
 * An input is considered property binding syntax when
 *
 * a. empty curly bracket e.g  `{}` or `{   }`
 *
 * b. has key property e.g `anyKey` or `"anyKey"` or `'anyKey'` with colon
 *
 * c. empty string [for initial code completion snippet]
 */
export const isPropertyBindingInfo = (input: string): boolean => {
  if (input.trim().length === 0) {
    return true;
  }
  // check empty curly bracket
  if (input.slice(1).trim().length === 1) {
    return true;
  }
  return propBindingSyntax.test(input);
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

const extractor = (regExp: RegExp, input: string, checkingStart = true) => {
  let regResult: RegExpExecArray | null;
  const fragments: number[] = [];
  // resetting
  regExp.lastIndex = 0;
  while ((regResult = regExp.exec(input)) !== null) {
    // scape special chars
    if (regResult[1]) {
      continue;
    }
    // all scape char should have been escaped
    fragments.push(regResult.index);
    if (checkingStart) {
      break;
    }
  }
  if (fragments.length === 0 && !checkingStart) {
    // missing closing curly bracket
    fragments.push(input.length);
  }
  return fragments;
};

export const extractBindingExpression = (
  input: string
): ExtractBindingExpression => {
  const startExtract = extractor(start, input);
  const endExtract = extractor(end, input, false);
  const startIndex = startExtract.pop() ?? 0;
  const endIndex = endExtract.pop() ?? 0;
  return {
    startIndex,
    endIndex,
    expression: input.slice(startIndex, endIndex + 1),
  };
};
