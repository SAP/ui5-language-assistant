import { createToken, Lexer } from "chevrotain";
import {
  KEY,
  STRING_VALUE,
  BOOLEAN_VALUE,
  COLON,
  COMMA,
  PROPERTY_BINDING_INFO,
  LEFT_SQUARE,
  LEFT_CURLY,
  NULL_VALUE,
  NUMBER_VALUE,
  RIGHT_SQUARE,
  RIGHT_CURLY,
  WHITE_SPACE,
} from "../constant";

const whiteSpace = createToken({
  name: WHITE_SPACE,
  pattern: /\s+/,
  // group: Lexer.SKIPPED,
  line_breaks: true,
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
  pattern: /\w+/,
});
const colon = createToken({
  name: COLON,
  pattern: /:/,
  label: ":",
});
const stringValue = createToken({
  name: STRING_VALUE,
  pattern: /('|")(.*?)('|")/,
});

const booleanValue = createToken({
  name: BOOLEAN_VALUE,
  pattern: /true|false/,
});
const numberValue = createToken({
  name: NUMBER_VALUE,
  pattern: /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/,
});

const nullValue = createToken({ name: NULL_VALUE, pattern: /null/ });

const comma = createToken({
  name: COMMA,
  pattern: /,/,
  label: ",",
});

export const propertyBindingTokenMap = {
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
};
export const lexerDefinition = {
  modes: {
    [PROPERTY_BINDING_INFO]: [
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
    ],
  },
  defaultMode: PROPERTY_BINDING_INFO,
};
