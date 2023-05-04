import {
  IToken,
  ILexingError,
  IRecognitionException,
  MismatchedTokenException,
  NoViableAltException,
} from "chevrotain";
import { LEXER_ERROR, PARSE_ERROR } from "../constant";
import type { Position, Range } from "vscode-languageserver-types";
import type {
  LexerError,
  NodeType,
  ParseError,
  ParseErrorBase,
  VisitorParam,
} from "../types/property-binding-info";
import { getRange } from "./range";

export const createNode = <T extends NodeType>(
  token: IToken,
  type: T,
  param?: VisitorParam
): { type: T; text: string; range: Range } => {
  const text = token.image;
  const range = getRange(token, param?.position);
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
    if (position) {
      result.push({
        range: {
          start: {
            line: item.line ? position.line + item.line - 1 : position.line,
            character: item.column
              ? position.character + item.column - 1
              : position.character,
          },
          end: {
            line: item.line ? position.line + item.line - 1 : position.line,
            character: item.column
              ? position.character + item.column
              : position.character,
          },
        },
        text: "",
        type: LEXER_ERROR,
      });
      continue;
    }
    result.push({
      range: {
        start: {
          line: item.line ? item.line - 1 : 0,
          character: item.column ? item.column - 1 : 0,
        },
        end: {
          line: item.line ? item.line - 1 : 0,
          character: item.column ?? 0,
        },
      },
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
    let node = createNode(item.token, PARSE_ERROR, { position });
    tokens.push({ ...node, tokenTypeName: item.token.tokenType.name });
    for (const resync of item.resyncedTokens) {
      node = createNode(resync, PARSE_ERROR, { position });
      tokens.push({ ...node, tokenTypeName: resync.tokenType.name });
    }
    const itemWithPreviousToken = item as
      | MismatchedTokenException
      | NoViableAltException;
    let previousToken: ParseErrorBase | undefined;
    if (itemWithPreviousToken.previousToken) {
      node = createNode(itemWithPreviousToken.previousToken, PARSE_ERROR, {
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
