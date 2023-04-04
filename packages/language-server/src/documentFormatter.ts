import type { TextDocument } from "vscode-languageserver";
import { TextEdit, Range, Position } from "vscode-languageserver";
import { format } from "prettier";

export interface FormatterOptions {
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
  /**
   * @default true
   */
  useSnippetSyntax: boolean;
}

export const printOptions: FormatterOptions = {
  printWidth: 300,
  tabWidth: 4,
  useTabs: false,
  useSnippetSyntax: true,
};

export function formatDocument(document: TextDocument): TextEdit[] {
  const range: Range = Range.create(
    Position.create(0, 0),
    document.positionAt(document.getText().length)
  );
  return documentFormatter.formatRange(document, range);
}

export function formatRange(document: TextDocument, range: Range): TextEdit[] {
  let selectedXml = document.getText(range);
  const options: Record<string, string | number | boolean> = {
    // parser: 'xml',
    tabWidth: printOptions.tabWidth,
    printWidth: printOptions.printWidth,
    xmlSelfClosingTags: true,
    xmlWhitespaceSensitivity: "ignore",
  };
  selectedXml = format(selectedXml, options);
  return [TextEdit.replace(range, selectedXml)];
}

export const documentFormatter = {
  formatDocument: formatDocument,
  formatRange: formatRange,
};
