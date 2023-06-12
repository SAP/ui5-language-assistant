import { Range } from "vscode-languageserver-types";
import { IToken, CstNodeLocation, CstNode } from "chevrotain";
import type { Position } from "vscode-languageserver-types";
import {
  ARRAY,
  BOOLEAN_VALUE,
  COLON,
  COMMA,
  KEY,
  LEFT_CURLY,
  LEFT_SQUARE,
  LEXER_ERROR,
  NULL_VALUE,
  NUMBER_VALUE,
  OBJECT,
  OBJECT_ITEM,
  PARSE_ERROR,
  RIGHT_CURLY,
  RIGHT_SQUARE,
  SPECIAL_CHARS,
  STRING_VALUE,
  TEMPLATE,
  VALUE,
  WHITE_SPACE,
} from "../constant";

export interface VisitorParam {
  position?: Position;
  location?: CstNodeLocation;
}
export type TokenType =
  | typeof WHITE_SPACE
  | typeof SPECIAL_CHARS
  | typeof COLON
  | typeof KEY
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
export interface SpecialChars extends Base {
  type: typeof SPECIAL_CHARS;
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

export interface LexerError extends Base {
  type: typeof LEXER_ERROR | typeof SPECIAL_CHARS;
}
export interface ParseErrorBase extends Base {
  type: typeof PARSE_ERROR;
  tokenTypeName: string;
}

export interface ParseError extends ParseErrorBase {
  merged: ParseErrorBase[];
  previousToken?: ParseErrorBase;
  message: string;
}

export interface CollectionValue {
  leftSquare?: LeftSquare;
  elements: (PrimitiveValue | StructureValue)[];
  range?: Range; // range which include left bracket, element and right bracket
  rightSquare?: RightSquare;
  commas?: Comma[];
  type: "collection-value";
}
export type Value = PrimitiveValue | StructureValue | CollectionValue;

export interface StructureElement {
  key?: Key;
  colon?: Colon;
  value?: Value;
  range?: Range; // range of this element which include key, colon and value
  type: "structure-element";
}

export interface StructureValue {
  leftCurly?: LeftCurly;
  rightCurly?: RightCurly;
  elements: StructureElement[];
  range?: Range; // range which include left bracket, element and right bracket,
  commas?: Comma[];
  type: "structure-value";
}
export interface Template {
  bindings: StructureValue[];
  type: "template";
  spaces: WhiteSpaces[];
}

export interface ParseResult {
  cst: CstNode;
  ast: Template;
  tokens: IToken[];
  errors: {
    lexer: LexerError[];
    parse: ParseError[];
  };
}

export interface CreateToken<T = TokenType> {
  type: T;
  text: string;
  range: Range;
}

export type TemplateChildren = {
  [OBJECT]?: ObjectCstNode[];
};
export interface TemplateCstNode extends CstNode {
  name: typeof TEMPLATE;
  children: TemplateChildren;
}

export type ObjectChildren = {
  [LEFT_CURLY]?: IToken[];
  [RIGHT_CURLY]?: IToken[];
  [OBJECT_ITEM]?: ObjectItemCstNode[];
  [COMMA]?: IToken[];
};

export interface ObjectCstNode extends CstNode {
  name: typeof OBJECT;
  children: ObjectChildren;
}

export type ArrayChildren = {
  [LEFT_SQUARE]?: IToken[];
  [RIGHT_SQUARE]?: IToken[];
  [VALUE]?: ValueCstNode[];
  [COMMA]?: IToken[];
};
export interface ArrayCstNode extends CstNode {
  name: typeof ARRAY;
  children: ArrayChildren;
}

export type ObjectItemChildren = {
  [KEY]?: IToken[];
  [COLON]?: IToken[];
  [VALUE]?: ValueCstNode[];
};
export interface ObjectItemCstNode extends CstNode {
  name: typeof OBJECT_ITEM;
  children: ObjectItemChildren;
}

export type ValueChildren = {
  [STRING_VALUE]?: IToken[];
  [NUMBER_VALUE]?: IToken[];
  [OBJECT]?: ObjectCstNode[];
  [ARRAY]?: ArrayCstNode[];
  [BOOLEAN_VALUE]?: IToken[];
  [NULL_VALUE]?: IToken[];
};
export interface ValueCstNode extends CstNode {
  name: typeof VALUE;
  children: ValueChildren;
}

export type BindingNode = Template | StructureElement | Value | CollectionValue;
