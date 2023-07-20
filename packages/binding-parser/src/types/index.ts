export * as BindingParserTypes from "./binding-parser";

export interface ExtractBindingExpression {
  startIndex: number;
  endIndex: number;
  expression: string;
}
