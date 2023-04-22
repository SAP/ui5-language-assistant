import { Lexer } from "chevrotain";
import { lexerDefinition } from "./token";

export { propertyBindingTokenMap } from "./token";
export const lexer = new Lexer(lexerDefinition, {
  // Enable validation for debugging
  skipValidations: true,
});
