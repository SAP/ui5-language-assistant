import { PropertyBindingInfoTypes as BindingTypes } from "@ui5-language-assistant/binding-parser";
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
 * An input is considered property binding syntax when
 *
 * a. is empty curly bracket e.g  `{}` or `{   }`
 *
 * b. has starting and closing curly bracket and key property with colon e.g `{anyKey: }` or `{"anyKey":}` or `{'anyKey':}`
 *
 * c. empty string [for initial code completion snippet]
 */
export const isPropertyBindingInfo = (
  ast: BindingTypes.Ast,
  input: string
): boolean => {
  // check empty string
  if (input.trim().length === 0) {
    return true;
  }
  // check empty curly brackets
  if (
    ast.leftCurly?.text &&
    ast.elements.length === 0 &&
    ast.rightCurly?.text
  ) {
    return true;
  }
  // check it has at least one key with colon
  const result = ast.elements.find(
    (item) => item.key?.text && item.colon?.text
  );
  if (result && ast.leftCurly?.text && ast.rightCurly?.text) {
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
  input: string,
  initialIndex = 0,
): ExtractBindingExpression[] => {
  const result: ExtractBindingExpression[] = [];
  const startExtract = extractor(start, input);
  const endExtract = extractor(end, input, false);
  const [firstEndIndex, ...rest] = endExtract;
  const startIndex = (startExtract.pop() ?? 0);
  const expression = input.slice(startIndex, firstEndIndex + 1);
  result.push({
    startIndex: startIndex + initialIndex,
    endIndex: firstEndIndex + initialIndex + 1,
    expression,
  });
  if (rest.length > 0) {
    // multiple binding syntax
    const restResult = extractBindingExpression(
      input.slice(firstEndIndex + 1),
      firstEndIndex + initialIndex + 1
    );
    result.push(...restResult);
  }
  return result;
};
