import {
  rangeContained,
  BindingParserTypes as BindingTypes,
} from "@ui5-language-assistant/binding-parser";

export const filterLexerError = (
  binding: BindingTypes.StructureValue,
  errors: {
    lexer: BindingTypes.LexerError[];
    parse: BindingTypes.ParseError[];
  }
): BindingTypes.LexerError[] => {
  const result: BindingTypes.LexerError[] = [];
  const lexErr = errors.lexer.filter(
    (item) => binding.range && rangeContained(binding.range, item.range)
  );
  result.push(...lexErr);

  return result;
};
export const filterParseError = (
  binding: BindingTypes.StructureValue,
  errors: {
    lexer: BindingTypes.LexerError[];
    parse: BindingTypes.ParseError[];
  }
): BindingTypes.ParseError[] => {
  const result: BindingTypes.ParseError[] = [];

  const parseErr = errors.parse.filter(
    (item) => binding.range && rangeContained(binding.range, item.range)
  );
  result.push(...parseErr);

  return result;
};
