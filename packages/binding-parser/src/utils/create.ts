import {
  IToken,
  ILexingError,
  IRecognitionException,
  MismatchedTokenException,
  NoViableAltException,
} from "chevrotain";
import { LEXER_ERROR, PARSE_ERROR } from "../constant";
import type { Position } from "vscode-languageserver-types";
import type {
  CreateToken,
  LexerError,
  TokenType,
  ParseError,
  ParseErrorBase,
  VisitorParam,
} from "../types/binding-parser";
import { getLexerRange, getRange } from "./range";

export const createToken = <T extends TokenType>(
  token: IToken,
  type: T,
  param?: VisitorParam
): CreateToken<T> => {
  const text = token.image;
  const range = getRange(token, param);
  return {
    type,
    text,
    range,
  };
};

export const createLexerErrors = (
  node: ILexingError[],
  position?: Position
): LexerError[] => {
  const result: LexerError[] = [];
  for (const item of node) {
    const range = getLexerRange(item, position);
    result.push({
      range,
      text: "",
      type: LEXER_ERROR,
    });
  }
  return result;
};

export const createParseErrors = (
  nodes: (
    | IRecognitionException
    | MismatchedTokenException
    | NoViableAltException
  )[],
  position?: Position
): ParseError[] => {
  const result: ParseError[] = [];
  let tokens: ParseErrorBase[] = [];
  for (const item of nodes) {
    let node = createToken(item.token, PARSE_ERROR, { position });
    tokens.push({ ...node, tokenTypeName: item.token.tokenType.name });
    for (const resync of item.resyncedTokens) {
      node = createToken(resync, PARSE_ERROR, { position });
      tokens.push({ ...node, tokenTypeName: resync.tokenType.name });
    }
    const itemWithPreviousToken = item as
      | MismatchedTokenException
      | NoViableAltException;
    let previousToken: ParseErrorBase | undefined;
    if (itemWithPreviousToken.previousToken) {
      node = createToken(itemWithPreviousToken.previousToken, PARSE_ERROR, {
        position,
      });
      previousToken = {
        ...node,
        tokenTypeName: itemWithPreviousToken.previousToken.tokenType.name,
      };
    }

    if (tokens.length === 1) {
      result.push({
        type: PARSE_ERROR,
        range: tokens[0].range,
        text: tokens[0].text,
        merged: tokens,
        tokenTypeName: tokens[0].tokenTypeName,
        previousToken,
        message: item.message,
      });
      // rest tokens
      tokens = [];
      continue;
    }
    const [first] = tokens;
    const last = tokens[tokens.length - 1];
    let text = "";
    let tokenTypeName = "";
    tokens.forEach((t) => {
      text += t.text;
      if (tokenTypeName) {
        tokenTypeName = `${tokenTypeName}|${t.tokenTypeName}`;
      } else {
        tokenTypeName = t.tokenTypeName;
      }
    });
    result.push({
      type: PARSE_ERROR,
      range: {
        start: first.range.start,
        end: last.range.end,
      },
      text,
      merged: tokens,
      tokenTypeName,
      previousToken,
      message: item.message,
    });
    // rest token
    tokens = [];
  }
  return result;
};
