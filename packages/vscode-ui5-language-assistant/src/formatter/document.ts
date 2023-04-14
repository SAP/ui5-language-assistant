import type { FormattingOptions, TextDocument } from "vscode";
import { TextEdit, Range, Position, workspace } from "vscode";
import { format } from "prettier";
import { SPLIT_ATTRIBUTE_ON_FORMAT } from "../constants";

interface PrintOptions {
  /**
   * Indent lines with tabs instead of spaces
   * @default false
   */
  useTabs: boolean;
  /**
   * Specify the number of spaces per indentation-level.
   */
  tabWidth: number;
  /**
   * Specify the line length that the printer will wrap on.
   */
  printWidth: number;
}

export const printOptions: PrintOptions = {
  printWidth: 300,
  tabWidth: 4,
  useTabs: false,
};

const getOptions = (
  opt?: FormattingOptions
): Record<string, string | number | boolean | undefined> => {
  const splitAttributesOnFormat =
    workspace.getConfiguration().get(SPLIT_ATTRIBUTE_ON_FORMAT) === true;
  const options = {
    parser: "xml",
    tabWidth: opt?.tabSize ?? printOptions.tabWidth,
    printWidth: splitAttributesOnFormat ? undefined : printOptions.printWidth, // not working with combination of single attribute per line
    xmlSelfClosingTags: true,
    xmlWhitespaceSensitivity: "ignore",
    singleAttributePerLine: splitAttributesOnFormat,
  };
  return options;
};

export function formatRange(
  document: TextDocument,
  range: Range,
  opt?: FormattingOptions
): TextEdit[] {
  let selectedXml = document.getText(range);
  const options = getOptions(opt);
  selectedXml = format(selectedXml, options);
  return [TextEdit.replace(range, selectedXml)];
}

export function formatDocument(document: TextDocument): TextEdit[] {
  const range: Range = new Range(
    new Position(0, 0),
    document.positionAt(document.getText().length)
  );
  return formatRange(document, range);
}
