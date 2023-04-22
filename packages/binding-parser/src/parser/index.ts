import type {
  Ast,
  ParseResult,
  WhiteSpaces,
} from "../types/property-binding-info";
import type { Position } from "vscode-languageserver-types";
import { propertyBindingInfoParser } from "./property-binding-info";
import { lexer } from "../lexer";
import { WHITE_SPACE } from "../constant";
import {
  createLexerErrors,
  createNode,
  createParseErrors,
} from "../utils/create";
import { propertyBindingInfoVisitor } from "../ast";

export const parsePropertyBindingInfo = (
  text: string,
  position?: Position
): ParseResult => {
  const { tokens, errors: lexErrors } = lexer.tokenize(text);
  const spaceTokens = tokens.filter((t) => t.tokenType.name === WHITE_SPACE);
  const spaces: WhiteSpaces[] = [];
  for (const space of spaceTokens) {
    spaces.push(createNode(space, WHITE_SPACE, { position }));
  }
  const tokenWithoutSpaces = tokens.filter(
    (t) => t.tokenType.name !== WHITE_SPACE
  );
  propertyBindingInfoParser.input = tokenWithoutSpaces;
  const cst = propertyBindingInfoParser.PropertyBindingInfo();
  const parseErrors = propertyBindingInfoParser.errors;
  const ast = propertyBindingInfoVisitor.visit(cst, position) as Ast;
  ast.errors.lexer.push(...createLexerErrors(lexErrors, position));
  ast.errors.parse.push(...createParseErrors(parseErrors, position));
  ast.spaces.push(...spaces);
  return {
    cst,
    ast,
    tokens,
    lexErrors,
    parseErrors,
  };
};
