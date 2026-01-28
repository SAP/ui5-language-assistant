import { LEFT_CURLY, RIGHT_CURLY } from "../constant";
export * as BindingParserTypes from "./binding-parser";

export interface ExtractBindingSyntax {
  startIndex: number;
  endIndex: number;
  expression: string;
}

export interface Token {
  type: typeof LEFT_CURLY | typeof RIGHT_CURLY;
  start: number;
  end: number;
}
