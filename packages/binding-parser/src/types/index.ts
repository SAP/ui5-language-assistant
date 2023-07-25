export * as BindingParserTypes from "./binding-parser";

export interface ExtractBindingSyntax {
  startIndex: number;
  endIndex: number;
  expression: string;
}
