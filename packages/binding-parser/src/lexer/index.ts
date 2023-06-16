import { Lexer } from "chevrotain";
import { lexerDefinition } from "./token";

export { bindingParserTokenMap } from "./token";
export const lexer = new Lexer(lexerDefinition, {
  // Enable validation for debugging
  skipValidations: true,
});
