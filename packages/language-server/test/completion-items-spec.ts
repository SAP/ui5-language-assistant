import { expect } from "chai";
import { map, uniq, forEach } from "lodash";
import {
  TextDocument,
  TextDocumentPositionParams,
  Position,
  TextDocumentIdentifier,
  CompletionItemKind,
  CompletionItem,
  TextEdit,
  Range
} from "vscode-languageserver";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import {
  generateModel,
  GEN_MODEL_TIMEOUT,
  expectExists
} from "@ui5-language-assistant/test-utils";

import { getCompletionItems, computeLSPKind } from "../src/completion-items";
import { UI5XMLViewCompletion } from "@ui5-language-assistant/xml-views-completion";

describe("the UI5 language assistant Code Completion Services", () => {
  let ui5SemanticModel: UI5SemanticModel;
  before(async function() {
    this.timeout(GEN_MODEL_TIMEOUT);
    //TODO: use 1.71.x
    ui5SemanticModel = await generateModel({ version: "1.74.0" });
  });

  // Return the first part of a tag name suggestion insert text
  function getTagName(textEdit: TextEdit | undefined): string | undefined {
    if (textEdit === undefined) {
      return undefined;
    }
    const result = /^([^> ]*)/.exec(textEdit.newText);
    return result?.[1];
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
    forEach(text, character => {
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

  /** Check the suggestions will be displayed to the user according to the range and filter text */
  function assertSuggestionsAreValid(
    suggestions: CompletionItem[],
    xmlSnippet: string
  ): void {
    const xmlText = xmlSnippet.replace("⇶", "");
    const offset = xmlSnippet.indexOf("⇶");
    const doc: TextDocument = createTextDocument("xml", xmlText);
    const position = doc.positionAt(offset);

    forEach(suggestions, suggestion => {
      expectExists(suggestion.textEdit, "suggestion contains a textEdit");
      assertRangeContains(
        suggestion.textEdit.range,
        position,
        suggestion.label
      );
      // The filter text is checked until the position in the document
      // (for example, we can replace "Ab⇶cd" with "Abzzz" even though "c" and "d" aren't in "Abzzz")
      const checkedRange = {
        start: suggestion.textEdit?.range.start,
        end: position
      };
      assertFilterMatches(
        suggestion.filterText ?? suggestion.label,
        doc.getText(checkedRange),
        suggestion.label
      );
    });
  }

  function getTextInRange(
    xmlSnippet: string,
    range: Range | undefined
  ): string {
    const xmlText = xmlSnippet.replace("⇶", "");
    const doc: TextDocument = createTextDocument("xml", xmlText);
    return doc.getText(range);
  }

  it("will get completion values for UI5 class", () => {
    const xmlSnippet = `<GridLi⇶`;
    const suggestions = getSuggestions(xmlSnippet);
    const suggestionNames = map(suggestions, suggestion => ({
      label: suggestion.label,
      tagName: getTagName(suggestion.textEdit),
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range)
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionNames).to.deep.equalInAnyOrder([
      { label: "GridList", tagName: "f:GridList", replacedText: "GridLi" },
      {
        label: "GridListItem",
        tagName: "f:GridListItem",
        replacedText: "GridLi"
      }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Class]);
  });

  it("will get completion values for UI5 class by fully qualified name", () => {
    const xmlSnippet = `<sap.m.Busy⇶`;
    const suggestions = getSuggestions(xmlSnippet);
    const suggestionNames = map(suggestions, suggestion => ({
      label: suggestion.label,
      tagName: getTagName(suggestion.textEdit),
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range)
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionNames).to.deep.equalInAnyOrder([
      {
        label: "BusyDialog",
        tagName: "m:BusyDialog",
        replacedText: "sap.m.Busy"
      },
      {
        label: "BusyIndicator",
        tagName: "m:BusyIndicator",
        replacedText: "sap.m.Busy"
      }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Class]);
  });

  it("will get completion values for UI5 class when the cursor is in the middle of a name", () => {
    const xmlSnippet = `<Busy⇶Dialo`;
    const suggestions = getSuggestions(xmlSnippet);
    const suggestionNames = map(suggestions, suggestion => ({
      label: suggestion.label,
      tagName: getTagName(suggestion.textEdit),
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range)
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionNames).to.deep.equalInAnyOrder([
      {
        label: "BusyDialog",
        tagName: "m:BusyDialog",
        replacedText: "BusyDialo"
      },
      {
        label: "BusyIndicator",
        tagName: "m:BusyIndicator",
        replacedText: "BusyDialo"
      },
      {
        label: "LocalBusyIndicator",
        tagName: "core:LocalBusyIndicator",
        replacedText: "BusyDialo"
      },
      {
        label: "InboxBusyIndicator",
        tagName: "composite:InboxBusyIndicator",
        replacedText: "BusyDialo"
      }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Class]);
  });

  it("will get completion values for UI5 class FQN when the cursor is in the middle of a name", () => {
    const xmlSnippet = `<sap.m.Busy⇶Dialo`;
    const suggestions = getSuggestions(xmlSnippet);
    const suggestionNames = map(suggestions, suggestion => ({
      label: suggestion.label,
      tagName: getTagName(suggestion.textEdit),
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range)
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionNames).to.deep.equalInAnyOrder([
      {
        label: "BusyDialog",
        tagName: "m:BusyDialog",
        replacedText: "sap.m.BusyDialo"
      },
      {
        label: "BusyIndicator",
        tagName: "m:BusyIndicator",
        replacedText: "sap.m.BusyDialo"
      }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Class]);
  });

  it("will get completion values for UI5 class with namespace when the cursor is in the middle of a name", () => {
    const xmlSnippet = `<m:Busy⇶Dialo xmlns:m="sap.m"`;
    const suggestions = getSuggestions(xmlSnippet);
    const suggestionNames = map(suggestions, suggestion => ({
      label: suggestion.label,
      tagName: getTagName(suggestion.textEdit),
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range)
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionNames).to.deep.equalInAnyOrder([
      {
        label: "BusyDialog",
        tagName: "m:BusyDialog",
        replacedText: "m:BusyDialo"
      },
      {
        label: "BusyIndicator",
        tagName: "m:BusyIndicator",
        replacedText: "m:BusyDialo"
      }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Class]);
  });

  it("will get completion values for UI5 class from all namespaces when default namespace exists", () => {
    const xmlSnippet = `<RadioButtonGrou⇶ xmlns="sap.m" xmlns:commons="sap.ui.commons"`;
    const suggestions = getSuggestions(xmlSnippet);
    const suggestionNames = map(suggestions, suggestion => ({
      label: suggestion.label,
      text: getTagName(suggestion.textEdit),
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range)
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionNames).to.deep.equalInAnyOrder([
      {
        label: "RadioButtonGroup",
        text: "RadioButtonGroup",
        replacedText: "RadioButtonGrou"
      },
      {
        label: "RadioButtonGroup",
        text: "commons:RadioButtonGroup",
        replacedText: "RadioButtonGrou"
      }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Class]);
  });

  it("will get completion values for UI5 class from a specific namespace", () => {
    const xmlSnippet = `<f:Ca⇶ xmlns:f="sap.f"`;
    const suggestions = getSuggestions(xmlSnippet);
    const suggestionNames = map(suggestions, suggestion => ({
      label: suggestion.label,
      text: getTagName(suggestion.textEdit),
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range)
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionNames).to.deep.equalInAnyOrder([
      { label: "Card", text: "f:Card", replacedText: "f:Ca" }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Class]);
  });

  it("will get completion values for UI5 property", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List show⇶`;
    const suggestions = getSuggestions(xmlSnippet);
    const suggestionNames = map(suggestions, suggestion => ({
      label: suggestion.label,
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range)
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionNames).to.deep.equalInAnyOrder([
      { label: "showNoData", replacedText: "show" },
      { label: "showSeparators", replacedText: "show" },
      { label: "showUnread", replacedText: "show" }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Property]);
  });

  it("will get completion values for UI5 property when the cursor is in the middle of a name", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List show⇶Separ`;
    const suggestions = getSuggestions(xmlSnippet);
    const suggestionNames = map(suggestions, suggestion => ({
      label: suggestion.label,
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range)
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionNames).to.deep.equalInAnyOrder([
      { label: "showNoData", replacedText: "showSepar" },
      { label: "showSeparators", replacedText: "showSepar" },
      { label: "showUnread", replacedText: "showSepar" }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Property]);
  });

  it("will get completion values for UI5 property when the cursor is in the middle of a name and there is a value", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List show⇶Separ="true"`;
    const suggestions = getSuggestions(xmlSnippet);
    const suggestionNames = map(suggestions, suggestion => ({
      label: suggestion.label,
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range)
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionNames).to.deep.equalInAnyOrder([
      { label: "showNoData", replacedText: "showSepar" },
      { label: "showSeparators", replacedText: "showSepar" },
      { label: "showUnread", replacedText: "showSepar" }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Property]);
  });

  it("will get completion values for UI5 event", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List update⇶`;
    const suggestions = getSuggestions(xmlSnippet);
    const suggestionNames = map(suggestions, suggestion => ({
      label: suggestion.label,
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range)
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionNames).to.deep.equalInAnyOrder([
      { label: "updateFinished", replacedText: "update" },
      { label: "updateStarted", replacedText: "update" }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Event]);
  });

  it("will get completion values for UI5 event when the cursor is in the middle of a name", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List update⇶Start`;
    const suggestions = getSuggestions(xmlSnippet);
    const suggestionNames = map(suggestions, suggestion => ({
      label: suggestion.label,
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range)
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionNames).to.deep.equalInAnyOrder([
      { label: "updateFinished", replacedText: "updateStart" },
      { label: "updateStarted", replacedText: "updateStart" }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Event]);
  });

  it("will get completion values for UI5 association", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List aria⇶`;
    const suggestions = getSuggestions(xmlSnippet);
    const suggestionNames = map(suggestions, suggestion => ({
      label: suggestion.label,
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range)
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionNames).to.deep.equalInAnyOrder([
      {
        label: "ariaLabelledBy",
        replacedText: "aria"
      }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Text]);
  });

  it("will get completion values for UI5 association when the cursor is in the middle of a name", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List aria⇶bbbb`;
    const suggestions = getSuggestions(xmlSnippet);
    const suggestionNames = map(suggestions, suggestion => ({
      label: suggestion.label,
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range)
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionNames).to.deep.equalInAnyOrder([
      {
        label: "ariaLabelledBy",
        replacedText: "ariabbbb"
      }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Text]);
  });

  it("will get completion values for UI5 aggregation", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List> <te⇶`;
    const suggestions = getSuggestions(xmlSnippet);
    const suggestionNames = map(suggestions, suggestion => ({
      label: suggestion.label,
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range)
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionNames).to.deep.equalInAnyOrder([
      { label: "contextMenu", replacedText: "te" },
      { label: "items", replacedText: "te" },
      { label: "swipeContent", replacedText: "te" }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Text]);
  });

  it("will get completion values for UI5 aggregation when the cursor is in the middle of a name", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List> <te⇶Menu`;
    const suggestions = getSuggestions(xmlSnippet);
    const suggestionNames = map(suggestions, suggestion => ({
      label: suggestion.label,
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range)
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionNames).to.deep.equalInAnyOrder([
      { label: "contextMenu", replacedText: "teMenu" },
      { label: "items", replacedText: "teMenu" },
      { label: "swipeContent", replacedText: "teMenu" }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Text]);
  });

  it("will get completion values for UI5 xmlns key namespace", () => {
    function getFQNFromDetail(detail: string | undefined): string | undefined {
      if (detail === undefined) {
        return detail;
      }
      return detail.replace("(deprecated) ", "").replace("(experimental) ", "");
    }

    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns:u⇶`;
    const suggestions = getSuggestions(xmlSnippet);
    const suggestionNames = map(suggestions, suggestion => ({
      label: suggestion.label,
      namespaceName: getFQNFromDetail(suggestion.detail),
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range)
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionNames).to.deep.equalInAnyOrder([
      {
        label: "unified",
        namespaceName: "sap.ui.unified",
        replacedText: "xmlns:u"
      },
      {
        label: "upload",
        namespaceName: "sap.m.upload",
        replacedText: "xmlns:u"
      },
      {
        label: "util",
        namespaceName: "sap.ui.core.util",
        replacedText: "xmlns:u"
      },
      { label: "ux3", namespaceName: "sap.ui.ux3", replacedText: "xmlns:u" },
      { label: "uxap", namespaceName: "sap.uxap", replacedText: "xmlns:u" },
      {
        label: "ubc",
        namespaceName: "sap.gantt.shape.ext.ubc",
        replacedText: "xmlns:u"
      },
      { label: "ui", namespaceName: "sap.ca.ui", replacedText: "xmlns:u" },
      { label: "ui", namespaceName: "sap.rules.ui", replacedText: "xmlns:u" },
      { label: "ui5", namespaceName: "sap.viz.ui5", replacedText: "xmlns:u" },
      {
        label: "ulc",
        namespaceName: "sap.gantt.shape.ext.ulc",
        replacedText: "xmlns:u"
      }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Text]);
  });

  function getFQNFromDetail(detail: string | undefined): string | undefined {
    if (detail === undefined) {
      return detail;
    }
    return detail.replace("(deprecated) ", "").replace("(experimental) ", "");
  }

  it("will get completion values for UI5 xmlns key namespace when the cursor is in the middle of a name", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns:ux⇶a`;
    const suggestions = getSuggestions(xmlSnippet);
    const suggestionNames = map(suggestions, suggestion => ({
      label: suggestion.label,
      namespaceName: getFQNFromDetail(suggestion.detail),
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range)
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionNames).to.deep.equalInAnyOrder([
      { label: "ux3", namespaceName: "sap.ui.ux3", replacedText: "xmlns:uxa" },
      { label: "uxap", namespaceName: "sap.uxap", replacedText: "xmlns:uxa" }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Text]);
  });

  it("will get completion values for UI5 xmlns key namespace when the cursor is in the middle of a name and there is a value", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns:ux⇶a="sap.m"`;
    const suggestions = getSuggestions(xmlSnippet);
    const suggestionNames = map(suggestions, suggestion => ({
      label: suggestion.label,
      namespaceName: getFQNFromDetail(suggestion.detail),
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range)
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionNames).to.deep.equalInAnyOrder([
      { label: "ux3", namespaceName: "sap.ui.ux3", replacedText: "xmlns:uxa" },
      { label: "uxap", namespaceName: "sap.uxap", replacedText: "xmlns:uxa" }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Text]);
  });

  it("will get completion values for UI5 xmlns value namespace", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns:ux3="⇶"`;
    const suggestions = getSuggestions(xmlSnippet);
    const suggestionNames = map(suggestions, suggestion => ({
      label: suggestion.label,
      text: suggestion.textEdit?.newText,
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range)
    }));
    expect(suggestionNames).to.deep.equalInAnyOrder([
      { label: "ux3", text: `"sap.ui.ux3"`, replacedText: `""` }
    ]);
  });

  it("will get completion values for UI5 xmlns value namespace when the cursor is in the middle of a name", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="ux⇶a"`;
    const suggestions = getSuggestions(xmlSnippet);
    const suggestionNames = map(suggestions, suggestion => ({
      label: suggestion.label,
      text: suggestion.textEdit?.newText,
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range)
    }));
    expect(suggestionNames).to.deep.equalInAnyOrder([
      { label: "ux3", text: `"sap.ui.ux3"`, replacedText: `"uxa"` },
      { label: "uxap", text: `"sap.uxap"`, replacedText: `"uxa"` }
    ]);
  });

  it("will get completion values for UI5 xmlns value namespace FQN when the cursor is in the middle of a name", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns:uxap="sap.u⇶i"`;
    const suggestions = getSuggestions(xmlSnippet);
    const suggestionNames = map(suggestions, suggestion => ({
      label: suggestion.label,
      text: suggestion.textEdit?.newText,
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range)
    }));
    expect(suggestionNames).to.deep.equalInAnyOrder([
      { label: "uxap", text: `"sap.uxap"`, replacedText: `"sap.ui"` }
    ]);
  });

  it("will get completion values for UI5 enum value", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List showSeparators="⇶"`;
    const suggestions = getSuggestions(xmlSnippet);
    const suggestionNames = map(suggestions, suggestion => ({
      label: suggestion.label,
      text: suggestion.textEdit?.newText,
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range)
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionNames).to.deep.equalInAnyOrder([
      { label: "All", text: `"All"`, replacedText: `""` },
      { label: "Inner", text: `"Inner"`, replacedText: `""` },
      { label: "None", text: `"None"`, replacedText: `""` }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.EnumMember]);
  });

  it("will get completion values for UI5 enum value when the cursor is in the middle of a name", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List showSeparators="n⇶ner"`;
    const suggestions = getSuggestions(xmlSnippet);
    const suggestionNames = map(suggestions, suggestion => ({
      label: suggestion.label,
      text: suggestion.textEdit?.newText,
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range)
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionNames).to.deep.equalInAnyOrder([
      { label: "Inner", text: `"Inner"`, replacedText: `"nner"` },
      { label: "None", text: `"None"`, replacedText: `"nner"` }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.EnumMember]);
  });

  it("will not get completion values for unknown class", () => {
    const xmlSnippet = `<Unknown⇶`;
    const suggestions = getSuggestions(xmlSnippet);
    expect(suggestions).to.be.empty;
  });

  it("will get completion values for UI5 properties, events and associations", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List ⇶`;
    const suggestions = getSuggestions(xmlSnippet);
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionKinds).to.deep.equalInAnyOrder([
      CompletionItemKind.Property,
      CompletionItemKind.Event,
      CompletionItemKind.Text
    ]);

    forEach(suggestions, suggestion => {
      // We're not replacing any text, just adding
      expect(getTextInRange(xmlSnippet, suggestion.textEdit?.range)).to.equal(
        ""
      );
    });
  });

  it("will return valid class suggestions for empty tag", () => {
    const xmlSnippet = `<⇶`;
    const suggestions = getSuggestions(xmlSnippet);
    expect(suggestions).to.not.be.empty;
    forEach(suggestions, suggestion => {
      // We're not replacing any text, just adding
      expect(getTextInRange(xmlSnippet, suggestion.textEdit?.range)).to.equal(
        ""
      );
    });
  });

  it("will return valid aggregation suggestions for empty tag", () => {
    const xmlSnippet = `<mvc:View xmlns:mvc="sap.ui.core.mvc">
      <⇶
    </mvc:View>`;
    const suggestions = getSuggestions(xmlSnippet);
    expect(suggestions).to.not.be.empty;
    forEach(suggestions, suggestion => {
      // We're not replacing any text, just adding
      expect(getTextInRange(xmlSnippet, suggestion.textEdit?.range)).to.equal(
        ""
      );
    });
  });

  it("will get completion values for UI5 experimental class", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m">
                          <content> <ContentS⇶`;
    const suggestions = getSuggestions(xmlSnippet);
    const suggestionNames = map(suggestions, suggestion => ({
      label: suggestion.label,
      tagName: getTagName(suggestion.textEdit),
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range)
    }));
    expect(suggestionNames).to.deep.equalInAnyOrder([
      {
        label: "ContentSwitcher",
        tagName: "unified:ContentSwitcher",
        replacedText: "ContentS"
      }
    ]);
    forEach(suggestions, suggestion => {
      expect(suggestion.detail).to.contain("experimental");
    });
  });

  it("will get the lsp completion item kind according to the suggestion type", () => {
    expectLspKind("UI5NamespacesInXMLAttributeKey", CompletionItemKind.Text);
    expectLspKind("UI5NamespacesInXMLAttributeValue", CompletionItemKind.Text);
    expectLspKind("UI5AggregationsInXMLTagName", CompletionItemKind.Text);
    expectLspKind("UI5PropsInXMLAttributeKey", CompletionItemKind.Property);
    expectLspKind("UI5ClassesInXMLTagName", CompletionItemKind.Class);
    expectLspKind("UI5EventsInXMLAttributeKey", CompletionItemKind.Event);
    expectLspKind("UI5EnumsInXMLAttributeValue", CompletionItemKind.EnumMember);
    expectLspKind("UI5UnknownKey", CompletionItemKind.Text);
  });

  function expectLspKind(
    suggestionType: string,
    expectedKind: CompletionItemKind
  ): void {
    const suggestion = { type: suggestionType } as UI5XMLViewCompletion;
    const lspKind = computeLSPKind(suggestion);
    expect(lspKind).to.equal(expectedKind);
  }

  function createTextDocument(
    languageId: string,
    content: string
  ): TextDocument {
    return TextDocument.create("uri", languageId, 0, content);
  }

  function getSuggestions(xmlSnippet: string): CompletionItem[] {
    const xmlText = xmlSnippet.replace("⇶", "");
    const offset = xmlSnippet.indexOf("⇶");
    const doc: TextDocument = createTextDocument("xml", xmlText);
    const pos: Position = doc.positionAt(offset);
    const uri: TextDocumentIdentifier = { uri: "uri" };
    const textDocPositionParams: TextDocumentPositionParams = {
      textDocument: uri,
      position: pos
    };

    const suggestions = getCompletionItems(
      ui5SemanticModel,
      textDocPositionParams,
      doc
    );
    // Check that all returned suggestions will be displayed to the user
    assertSuggestionsAreValid(suggestions, xmlSnippet);
    return suggestions;
  }
});
