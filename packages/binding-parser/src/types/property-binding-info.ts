import { Range } from "vscode-languageserver-types";
import {
  CstNode,
  CstChildrenDictionary,
  CstElement,
  IToken,
  CstNodeLocation,
  ILexingError,
  IRecognitionException,
  MismatchedTokenException,
  NoViableAltException,
} from "chevrotain";
import type { Position } from "vscode-languageserver-types";
import {
  BOOLEAN_VALUE,
  COLON,
  COMMA,
  KEY,
  LEFT_CURLY,
  LEFT_SQUARE,
  LEXER_ERROR,
  NULL_VALUE,
  NUMBER_VALUE,
  PARSE_ERROR,
  RIGHT_CURLY,
  RIGHT_SQUARE,
  STRING_VALUE,
  WHITE_SPACE,
} from "../constant";

export interface VisitorParam {
  position?: Position;
  location?: CstNodeLocation;
}
export type NodeType =
  | typeof WHITE_SPACE
  | typeof COLON
  | typeof KEY
  | typeof COLON
  | typeof LEFT_CURLY
  | typeof RIGHT_CURLY
  | typeof LEFT_SQUARE
  | typeof RIGHT_SQUARE
  | typeof STRING_VALUE
  | typeof NULL_VALUE
  | typeof NUMBER_VALUE
  | typeof COMMA
  | typeof BOOLEAN_VALUE
  | typeof PARSE_ERROR;

export interface Base {
  text: string;
  range: Range;
}

export interface Comma extends Base {
  type: typeof COMMA;
}
export interface WhiteSpaces extends Base {
  type: typeof WHITE_SPACE;
}
export interface LeftCurly extends Base {
  type: typeof LEFT_CURLY;
}
export interface RightCurly extends Base {
  type: typeof RIGHT_CURLY;
}
export interface LeftSquare extends Base {
  type: typeof LEFT_SQUARE;
}
export interface RightSquare extends Base {
  type: typeof RIGHT_SQUARE;
}
export interface Key extends Base {
  type: typeof KEY;
}
export interface Colon extends Base {
  type: typeof COLON;
}
export type PrimitiveValueType =
  | typeof STRING_VALUE
  | typeof NUMBER_VALUE
  | typeof NULL_VALUE
  | typeof BOOLEAN_VALUE;

export interface PrimitiveValue extends Base {
  type: PrimitiveValueType;
}

export type StructureValue = Ast;

export interface LexerError extends Base {
  type: typeof LEXER_ERROR;
}
export interface ParseErrorBase extends Base {
  type: typeof PARSE_ERROR;
  tokenTypeName: string;
}

export interface ParseError extends ParseErrorBase {
  merged: ParseErrorBase[];
  previousToken?: ParseErrorBase;
}

export interface CollectionValue {
  leftSquare?: LeftSquare;
  elements: (PrimitiveValue | StructureValue)[];
  range?: Range; // range which include left bracket, element and right bracket
  rightSquare?: RightSquare;
  errors: {
    lexer: LexerError[];
    parse: ParseError[];
  };
  spaces: WhiteSpaces[];
  commas: Comma[];
}
export type Value = PrimitiveValue | StructureValue | CollectionValue;

export interface AstElement {
  key?: Key;
  colon?: Colon;
  value?: Value;
  comma?: Comma;
  range?: Range; // range of this element which include key, colon value and comma
}
export interface Ast {
  leftCurly?: LeftCurly;
  elements: AstElement[]; // in case of collection value can be simple value e.g string
  range?: Range; // range which include left bracket, element and right bracket
  rightCurly?: RightCurly;
  errors: {
    lexer: LexerError[];
    parse: ParseError[];
  };
  spaces: WhiteSpaces[];
  commas: Comma[];
}

export interface ParseResult {
  cst;
  ast: Ast;
  tokens: IToken[];
  lexErrors: ILexingError[];
  parseErrors: IRecognitionException[];
}
