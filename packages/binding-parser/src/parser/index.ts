import type {
  Template,
  ParseResult,
  SpecialChars,
  WhiteSpaces,
} from "../types/property-binding-info";
import type { Position } from "vscode-languageserver-types";
import { propertyBindingInfoParser } from "./property-binding-info";
import { lexer } from "../lexer";
import { SPECIAL_CHARS, WHITE_SPACE } from "../constant";
import {
  createLexerErrors,
  createToken,
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
    spaces.push(createToken(space, WHITE_SPACE, { position }));
  }
  const knownTokens = tokens
    .filter((t) => t.tokenType.name !== WHITE_SPACE)
    .filter((t) => t.tokenType.name !== SPECIAL_CHARS);
  propertyBindingInfoParser.input = knownTokens;
  const cst = propertyBindingInfoParser.Template();
  const parseErrors = propertyBindingInfoParser.errors;
  const ast = propertyBindingInfoVisitor(position).visit(cst) as Template;
  ast.spaces.push(...spaces);
  /**
   * Special chars are added to token so that chevrotain recognize them and provide correct location information.
   * lets assume we have such input `{####path: }` and special token is not added to list of lexer token.
   * In this case, position information start from `path` will have 3 chars less as chevrotain escape them.
   *
   * We add them as lexer error so that meaningful diagnostic is provided for end user
   */
  const specialCharsToken = tokens.filter(
    (t) => t.tokenType.name === SPECIAL_CHARS
  );
  const specialChars: SpecialChars[] = [];
  for (const specialChar of specialCharsToken) {
    specialChars.push(createToken(specialChar, SPECIAL_CHARS, { position }));
  }
  return {
    cst,
    ast,
    tokens,
    errors: {
      lexer: [...createLexerErrors(lexErrors, position), ...specialChars],
      parse: createParseErrors(parseErrors, position),
    },
  };
};
