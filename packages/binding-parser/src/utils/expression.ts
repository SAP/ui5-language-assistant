import {
  END_OF_LINE,
  LEFT_CURLY,
  RIGHT_CURLY,
  WHITE_SPACE_REG,
  isPrimitiveValue,
} from "../api";
import { ExtractBindingSyntax, Token } from "../types";
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
 * Check if character is whitespace.
 *
 * @param character character to check
 * @returns boolean
 */
function isWhitespace(character: string | undefined): boolean {
  if (!character) {
    return false;
  }
  return WHITE_SPACE_REG.test(character);
}

/**
 * Check if character is escape char.
 *
 * @param character character to check
 * @returns boolean
 */
function isEscape(character: string | undefined): boolean {
  return character === "\\";
}

/**
 * Check if character is end of line.
 *
 * @param character character to check
 * @returns boolean
 */
function isEndOfLine(character: string | undefined): boolean {
  if (!character) {
    return false;
  }

  return END_OF_LINE.test(character);
}

/**
 * Check if input character is left curly bracket.
 *
 * @param character input character
 * @returns boolean
 */
function isLeftCurlyBracket(character: string | undefined): boolean {
  return character === "{";
}
/**
 * Check if input character is right curly bracket.
 *
 * @param character input character
 * @returns boolean
 */
function isRightCurlyBracket(character: string | undefined): boolean {
  return character === "}";
}

class ExtractBinding {
  private offset: number;
  private text: string;
  private tokens: Token[];
  private tokenIdx: number;
  private expressions: ExtractBindingSyntax[] = [];
  /**
   * Class constructor.
   *
   * @param text text to be tokenized
   * @returns void
   */
  constructor(text: string) {
    this.text = text;
    this.offset = 0;
    this.tokens = [];
    this.tokenIdx = 0;
    this.expressions = [];
  }
  /**
   * Peek token.
   *
   * @param count number of token to peek
   * @returns token or undefined
   */
  peekToken(count: number): Token | undefined {
    return this.tokens[count];
  }
  /**
   * Get next token.
   *
   * @param count number of token to increment
   * @returns token or undefined
   */
  nextToken(count = 1): Token | undefined {
    const tokenIdx = this.tokenIdx + count;
    this.tokenIdx = tokenIdx;
    return this.tokens[tokenIdx];
  }
  /**
   * Peek character.
   *
   * @param count number of character to peek
   * @returns undefine or string
   */
  peek(count = 0): undefined | string {
    if (this.offset + count >= this.text.length) {
      return undefined;
    }

    return this.text.charAt(this.offset + count);
  }

  /**
   * Get next char and increment offset.
   *
   * @param count amount characters to increment offset. By default one char
   * @returns undefine or string
   */
  next(count = 1): undefined | string {
    if (this.offset >= this.text.length) {
      return undefined;
    }
    // increment offset
    this.offset = this.offset + count;
    return this.text.charAt(count);
  }

  /**
   * Get image.
   *
   * @param start start of offset
   * @param end end of offset
   * @returns image for given offset
   */
  getImage(start: number, end: number): string {
    return this.text.substring(start, end);
  }
  /**
   * Create tokens for left and right curly bracket.
   */
  tokenize(): void {
    while (this.peek()) {
      const character = this.peek();
      if (isWhitespace(character) || isEndOfLine(character)) {
        this.next();
        continue;
      }
      if (isEscape(character)) {
        this.next(2);
        continue;
      }
      if (isLeftCurlyBracket(character)) {
        this.tokens.push({
          start: this.offset,
          end: this.offset + 1,
          type: LEFT_CURLY,
        });
      }

      if (isRightCurlyBracket(character)) {
        this.tokens.push({
          start: this.offset,
          end: this.offset + 1,
          type: RIGHT_CURLY,
        });
      }
      this.next();
    }
  }
  /**
   * Get binding expressions.
   *
   * @returns binding expressions
   */
  getExpressions() {
    return this.expressions;
  }
  /**
   * Extract start and end of brackets and add it to expressions.
   *
   * @returns void
   */
  extract() {
    if (this.text.trim() === "") {
      // empty
      this.expressions.push({
        startIndex: 0,
        endIndex: 0,
        expression: this.text,
      });
      return;
    }
    let leftCurly: Token[] = [];
    let rightCurly: Token[] = [];
    while (this.peekToken(this.tokenIdx)) {
      const token = this.peekToken(this.tokenIdx) as Token;
      if (token.type === LEFT_CURLY) {
        leftCurly.push(token);
        this.nextToken();
        continue;
      }
      if (token.type === RIGHT_CURLY) {
        while (this.peekToken(this.tokenIdx)) {
          const token = this.peekToken(this.tokenIdx) as Token;
          if (token.type === RIGHT_CURLY) {
            rightCurly.push(token);
            this.nextToken();
            continue;
          }
          if (token.type === LEFT_CURLY) {
            break;
          }
        }
        // valid syntax
        if (leftCurly.length === rightCurly.length) {
          const start = leftCurly[0].start;
          const end = rightCurly[rightCurly.length - 1].end;
          this.expressions.push({
            expression: this.getImage(start, end),
            endIndex: end,
            startIndex: start,
          });
          // reset
          leftCurly = [];
          rightCurly = [];
          continue;
        }
        // miss match left curly bracket
        if (leftCurly.length < rightCurly.length) {
          // take last right curly bracket
          const start = leftCurly[0].start;
          const end = rightCurly[rightCurly.length - 1].end;
          this.expressions.push({
            expression: this.getImage(start, end),
            endIndex: end,
            startIndex: start,
          });
          // reset
          leftCurly = [];
          rightCurly = [];
          continue;
        }
        // miss match right curly bracket
        if (leftCurly.length > rightCurly.length) {
          continue;
        }
      }
    }
    if (leftCurly.length > 0 && rightCurly.length === 0) {
      // handle missing right curly bracket
      const start = leftCurly[0].start;
      const end = this.offset - start;
      this.expressions.push({
        startIndex: start,
        endIndex: end,
        expression: this.getImage(start, end),
      });
    } else if (leftCurly.length > rightCurly.length) {
      // handle miss match right curly bracket
      const start = leftCurly[0].start;
      const end = rightCurly[rightCurly.length - 1].end;
      this.expressions.push({
        startIndex: start,
        endIndex: end,
        expression: this.getImage(start, end),
      });
    }
  }
}

/**
 * Extract binding syntax.
 *
 * Also handles escaping of '{' or '}'.
 */
export function extractBindingSyntax(input: string): ExtractBindingSyntax[] {
  const binding = new ExtractBinding(input);
  binding.tokenize();
  binding.extract();
  return binding.getExpressions();
}
