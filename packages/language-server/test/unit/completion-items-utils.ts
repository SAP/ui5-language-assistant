import { forEach, map, defaultsDeep } from "lodash";
import { expect } from "chai";
import {
  TextDocument,
  TextDocumentPositionParams,
  Position,
  TextDocumentIdentifier,
  CompletionItem,
  TextEdit,
  Range,
  CompletionItemKind,
} from "vscode-languageserver";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { expectExists } from "@ui5-language-assistant/test-utils";
import { getCompletionItems } from "../../src/completion-items";
import { Settings, getDefaultSettings } from "@ui5-language-assistant/settings";
import { Context } from "@ui5-language-assistant/context";

/** Return the first part of a tag name suggestion insert text */
export function getTagName(textEdit: TextEdit | undefined): string | undefined {
  if (textEdit === undefined) {
    return undefined;
  }
  const result = /^([^> ]*)/.exec(textEdit.newText);
  return result?.[1];
}

/** Use ⇶ to mark the cursor position */
export function getSuggestions(
  xmlSnippet: string,
  context: Context,
  settings?: Partial<Settings>
): CompletionItem[] {
  const { document, position } = getXmlSnippetDocument(xmlSnippet);
  const uri: TextDocumentIdentifier = { uri: "uri" };
  const textDocPositionParams: TextDocumentPositionParams = {
    textDocument: uri,
    position: position,
  };
  if (settings === undefined) {
    // In the tests - show experimental and deprecated by default
    settings = { codeAssist: { deprecated: true, experimental: true } };
  }
  const allSettings = defaultsDeep(
    {},
    settings,
    getDefaultSettings()
  ) as Settings;

  const suggestions = getCompletionItems({
    context,
    textDocumentPosition: textDocPositionParams,
    document,
    documentSettings: allSettings,
  });
  // Check that all returned suggestions will be displayed to the user
  assertSuggestionsAreValid(suggestions, xmlSnippet);
  return suggestions;
}

function createTextDocument(languageId: string, content: string): TextDocument {
  return TextDocument.create("uri", languageId, 0, content);
}

function getXmlSnippetDocument(xmlSnippet: string): {
  document: TextDocument;
  position: Position;
} {
  const xmlSnippetWithoutRanges = xmlSnippet
    .replace(/⭲/g, "")
    .replace(/⭰/g, "");
  const xmlText = xmlSnippetWithoutRanges.replace("⇶", "");
  const offset = xmlSnippetWithoutRanges.indexOf("⇶");
  const document: TextDocument = createTextDocument("xml", xmlText);
  const position: Position = document.positionAt(offset);
  return { document, position };
}

/** Use ⭲ to mark range start and ⭰ to mark range end */
export function getRanges(xmlSnippet: string): Range[] {
  const RANGE_START_CHAR = "⭲";
  const RANGE_END_CHAR = "⭰";

  const { document } = getXmlSnippetDocument(xmlSnippet);
  const ranges: Range[] = [];
  let xmlTextWithRanges = xmlSnippet.replace("⇶", "");
  while (xmlTextWithRanges.indexOf(RANGE_START_CHAR) !== -1) {
    const rangeStartIndex = xmlTextWithRanges.indexOf(RANGE_START_CHAR);
    xmlTextWithRanges = xmlTextWithRanges.replace(RANGE_START_CHAR, "");
    const rangeEndIndex = xmlTextWithRanges.indexOf(RANGE_END_CHAR);
    if (rangeEndIndex === -1) {
      break;
    }
    xmlTextWithRanges = xmlTextWithRanges.replace(RANGE_END_CHAR, "");
    ranges.push({
      start: document.positionAt(rangeStartIndex),
      end: document.positionAt(rangeEndIndex),
    });
  }
  return ranges;
}

export function getTextInRange(
  xmlSnippet: string,
  range: Range | undefined
): string {
  const { document } = getXmlSnippetDocument(xmlSnippet);
  return document.getText(range);
}

function rangeToString(range: Range): string {
  return `${range.start.line}:${range.start.character}-${range.end.line}:${range.end.character}`;
}

/** Check the suggestions will be displayed to the user according to the range and filter text */
function assertSuggestionsAreValid(
  suggestions: CompletionItem[],
  xmlSnippet: string
): void {
  const { document, position } = getXmlSnippetDocument(xmlSnippet);
  const filteredSuggestions = suggestions.filter(
    (i) => i.kind !== CompletionItemKind.Snippet
  );
  forEach(filteredSuggestions, (suggestion) => {
    expectExists(suggestion.textEdit, "suggestion contains a textEdit");
    const textEdit = suggestion.textEdit as TextEdit;
    assertRangeContains(textEdit.range, position, suggestion.label);
    assertRangesDoNotOverlap(
      document,
      suggestion.label,
      textEdit,
      suggestion.additionalTextEdits || []
    );
    // The filter text is checked until the position in the document
    // (for example, we can replace "Ab⇶cd" with "Abzzz" even though "c" and "d" aren't in "Abzzz")
    const checkedRange = {
      start: textEdit.range.start,
      end: position,
    };
    assertFilterMatches(
      suggestion.filterText ?? suggestion.label,
      document.getText(checkedRange),
      suggestion.label
    );
  });
}

function assertRangeContains(
  range: Range,
  position: Position,
  description: string
): void {
  // The range must be in the same line as the position
  expect(range.start.line, `${description}: range start line`).to.equal(
    position.line
  );
  expect(range.end.line, `${description}: range end line`).to.equal(
    position.line
  );
  expect(
    range.start.character,
    `${description}: range start character`
  ).to.be.at.most(position.character);
  expect(
    range.end.character,
    `${description}: range end character`
  ).to.be.at.least(position.character);
}

function assertRangesDoNotOverlap(
  document: TextDocument,
  description: string,
  textEdit: TextEdit,
  additionalTextEdits: TextEdit[]
): void {
  // First, sort the text edits by range start and end
  const allEdits = map([textEdit].concat(additionalTextEdits), (edit) => ({
    ...edit,
    startOffset: document.offsetAt(edit.range.start),
    endOffset: document.offsetAt(edit.range.end),
  }));
  allEdits.sort((first, second) => {
    if (
      first.startOffset === second.startOffset &&
      first.endOffset === second.endOffset
    ) {
      return 0;
    }
    if (
      first.startOffset < second.startOffset ||
      (first.startOffset === second.startOffset &&
        first.endOffset < second.endOffset)
    ) {
      return -1;
    }
    return 1;
  });

  // Check for overlap between every 2 consecutive text edits
  for (let i = 0; i < allEdits.length - 1; ++i) {
    const first = allEdits[i];
    const second = allEdits[i + 1];
    // Since we sorted them by range start and end, they would overlap if and only if
    // the second range start position is less than or equal to the first range end position.
    const overlapping = second.startOffset <= first.endOffset;
    expect(
      overlapping,
      `${description}: found overlapping text edits: "${
        first.newText
      }" at ${rangeToString(first.range)} and "${
        second.newText
      }" at ${rangeToString(second.range)}`
    ).to.be.false;
  }
}

function assertFilterMatches(
  filterText: string,
  text: string,
  description: string
): void {
  // This is a simple matcher - all characters in text are found in filterText in the same order.
  // For example, if the user requests code assist for "But" the filter text must contains "B", "u" and "t"
  // in this order (the filter text might be "sap.m.Button").
  // Actual filtering can be more complex, but if this filter doesn't pass the suggestion will likely not be
  // displayed to the user.
  let contains = true;
  let indexInFilterText = 0;
  forEach(text, (character) => {
    if (contains) {
      const characterIndex = filterText.indexOf(character, indexInFilterText);
      if (characterIndex < 0) {
        contains = false;
      } else {
        indexInFilterText = characterIndex + 1;
      }
    }
  });
  expect(
    contains,
    `${description}: ${filterText} does not contain all characters from ${text} in order`
  ).to.be.true;
}

export const getDefaultContext = (ui5Model: UI5SemanticModel): Context => {
  const viewFiles = {};
  viewFiles[""] = {};
  return {
    ui5Model,
    customViewId: "",
    manifestDetails: {
      appId: "",
      manifestPath: "manifest.json",
      flexEnabled: false,
      customViews: {},
      mainServicePath: undefined,
      minUI5Version: undefined,
    },
    services: {},
    yamlDetails: {
      framework: "SAPUI5",
      version: undefined,
    },
    viewFiles,
    documentPath: "",
  };
};
