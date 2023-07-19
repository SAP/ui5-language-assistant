import { createToken } from "chevrotain";
import {
  KEY,
  STRING_VALUE,
  BOOLEAN_VALUE,
  COLON,
  COMMA,
  LEFT_SQUARE,
  LEFT_CURLY,
  NULL_VALUE,
  NUMBER_VALUE,
  RIGHT_SQUARE,
  RIGHT_CURLY,
  WHITE_SPACE,
  SPECIAL_CHARS,
  TEMPLATE,
} from "../constant";

const whiteSpace = createToken({
  name: WHITE_SPACE,
  pattern: /\s+/,
  // group: Lexer.SKIPPED,
  line_breaks: true,
});
const specialChars = createToken({
  name: SPECIAL_CHARS,
  pattern:
    /(?:#|&gt;|&#47;|&#x2F;|!|"|\$|%|&|'|\(|\)|\*|\+|-|\.|\/|;|<|=|>|\?|@|\\|\^|_|`|~|\||)+/,
});

const leftCurly = createToken({
  name: LEFT_CURLY,
  pattern: /{/,
  label: "{",
});

const rightCurly = createToken({
  name: RIGHT_CURLY,
  pattern: /}/,
  label: "}",
});

const leftBracket = createToken({
  name: LEFT_SQUARE,
  pattern: /\[/,
  label: "[",
});
const rightBracket = createToken({
  name: RIGHT_SQUARE,
  pattern: /]/,
  label: "]",
});
const key = createToken({
  name: KEY,
  pattern: /[a-zA-Z$_][a-zA-Z0-9$_]*/,
});
const colon = createToken({
  name: COLON,
  pattern: /:/,
  label: ":",
});
const stringValue = createToken({
  name: STRING_VALUE,
  pattern: /(?:'|"|&apos;|&quot;)(?:.*?)(?:'|"|&apos;|&quot;)/,
});

const booleanValue = createToken({
  name: BOOLEAN_VALUE,
  pattern: /true|false/,
});
const numberValue = createToken({
  name: NUMBER_VALUE,
  pattern: /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/,
});

const nullValue = createToken({ name: NULL_VALUE, pattern: /null/ });

const comma = createToken({
  name: COMMA,
  pattern: /,/,
  label: ",",
});

export const bindingParserTokenMap = {
  whiteSpace,
  numberValue,
  leftCurly,
  rightCurly,
  leftBracket,
  rightBracket,
  comma,
  colon,
  booleanValue,
  stringValue,
  nullValue,
  key,
  specialChars,
};
export const lexerDefinition = {
  modes: {
    [TEMPLATE]: [
      whiteSpace,
      numberValue,
      leftCurly,
      rightCurly,
      leftBracket,
      rightBracket,
      comma,
      colon,
      booleanValue,
      stringValue,
      nullValue,
      key,
      specialChars,
    ],
  },
  defaultMode: TEMPLATE,
};
