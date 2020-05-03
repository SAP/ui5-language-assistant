import { expect } from "chai";
import { map, uniq, forEach } from "lodash";
import { CompletionItemKind } from "vscode-languageserver";
import { UI5XMLViewCompletion } from "@ui5-language-assistant/xml-views-completion";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import {
  generateModel,
  GEN_MODEL_TIMEOUT
} from "@ui5-language-assistant/test-utils";
import { computeLSPKind } from "../src/completion-items";
import {
  getSuggestions,
  getTextInRange,
  getTagName
} from "./completion-items-utils";

describe("the UI5 language assistant Code Completion Services", () => {
  // Cursor position after selecting the suggestion
  const CURSOR_POSITION = "${0}";

  // Pre-selected snippet text
  function getSelectedText(text: string): string {
    return `\${0:${text}}`;
  }

  let ui5SemanticModel: UI5SemanticModel;
  before(async function() {
    this.timeout(GEN_MODEL_TIMEOUT);
    //TODO: use 1.71.x
    ui5SemanticModel = await generateModel({ version: "1.74.0" });
  });

  it("will get completion values for UI5 property", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List show⇶`;
    const suggestions = getSuggestions(xmlSnippet, ui5SemanticModel);
    const suggestionsDetails = map(suggestions, suggestion => ({
      label: suggestion.label,
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range)
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionsDetails).to.deep.equalInAnyOrder([
      { label: "showNoData", replacedText: "show" },
      { label: "showSeparators", replacedText: "show" },
      { label: "showUnread", replacedText: "show" }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Property]);
  });

  it("will get completion values for UI5 property with default value when the cursor is in the middle of a name", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List show⇶Separ`;
    const suggestions = getSuggestions(xmlSnippet, ui5SemanticModel);
    const suggestionsDetails = map(suggestions, suggestion => ({
      label: suggestion.label,
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range),
      newText: suggestion.textEdit?.newText
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionsDetails).to.deep.equalInAnyOrder([
      {
        label: "showNoData",
        replacedText: "showSepar",
        newText: `showNoData="${getSelectedText("true")}"`
      },
      {
        label: "showSeparators",
        replacedText: "showSepar",
        newText: `showSeparators="${getSelectedText("All")}"`
      },
      {
        label: "showUnread",
        replacedText: "showSepar",
        newText: `showUnread="${getSelectedText("false")}"`
      }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Property]);
  });

  it("will get completion values for UI5 property when the cursor is in the middle of a name and there is a value", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List show⇶Separ="true"`;
    const suggestions = getSuggestions(xmlSnippet, ui5SemanticModel);
    const suggestionsDetails = map(suggestions, suggestion => ({
      label: suggestion.label,
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range),
      newText: suggestion.textEdit?.newText
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionsDetails).to.deep.equalInAnyOrder([
      { label: "showNoData", replacedText: "showSepar", newText: "showNoData" },
      {
        label: "showSeparators",
        replacedText: "showSepar",
        newText: "showSeparators"
      },
      { label: "showUnread", replacedText: "showSepar", newText: "showUnread" }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Property]);
  });

  it("will get completion values for UI5 event", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List update⇶`;
    const suggestions = getSuggestions(xmlSnippet, ui5SemanticModel);
    const suggestionsDetails = map(suggestions, suggestion => ({
      label: suggestion.label,
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range),
      newText: suggestion.textEdit?.newText
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionsDetails).to.deep.equalInAnyOrder([
      {
        label: "updateFinished",
        replacedText: "update",
        newText: `updateFinished="${CURSOR_POSITION}"`
      },
      {
        label: "updateStarted",
        replacedText: "update",
        newText: `updateStarted="${CURSOR_POSITION}"`
      }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Event]);
  });

  it("will get completion values for UI5 event when the cursor is in the middle of a name", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List update⇶Start="onUpdateStart"`;
    const suggestions = getSuggestions(xmlSnippet, ui5SemanticModel);
    const suggestionsDetails = map(suggestions, suggestion => ({
      label: suggestion.label,
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range),
      newText: suggestion.textEdit?.newText
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionsDetails).to.deep.equalInAnyOrder([
      {
        label: "updateFinished",
        replacedText: "updateStart",
        newText: "updateFinished"
      },
      {
        label: "updateStarted",
        replacedText: "updateStart",
        newText: "updateStarted"
      }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Event]);
  });

  it("will get completion values for UI5 association", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List aria⇶`;
    const suggestions = getSuggestions(xmlSnippet, ui5SemanticModel);
    const suggestionsDetails = map(suggestions, suggestion => ({
      label: suggestion.label,
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range)
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionsDetails).to.deep.equalInAnyOrder([
      {
        label: "ariaLabelledBy",
        replacedText: "aria"
      }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Reference]);
  });

  it("will get completion values for UI5 association when the cursor is in the middle of a name", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List aria⇶bbbb`;
    const suggestions = getSuggestions(xmlSnippet, ui5SemanticModel);
    const suggestionsDetails = map(suggestions, suggestion => ({
      label: suggestion.label,
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range)
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionsDetails).to.deep.equalInAnyOrder([
      {
        label: "ariaLabelledBy",
        replacedText: "ariabbbb"
      }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Reference]);
  });

  it("will get completion values for UI5 aggregation", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List> <te⇶`;
    const suggestions = getSuggestions(xmlSnippet, ui5SemanticModel);
    const suggestionsDetails = map(suggestions, suggestion => ({
      label: suggestion.label,
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range)
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionsDetails).to.deep.equalInAnyOrder([
      { label: "contextMenu", replacedText: "te" },
      { label: "items", replacedText: "te" },
      { label: "swipeContent", replacedText: "te" }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Field]);
  });

  it("will get completion values for UI5 aggregation when the cursor is in the middle of a name", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List> <te⇶Menu`;
    const suggestions = getSuggestions(xmlSnippet, ui5SemanticModel);
    const suggestionsDetails = map(suggestions, suggestion => ({
      label: suggestion.label,
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range),
      tagName: getTagName(suggestion.textEdit)
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionsDetails).to.deep.equalInAnyOrder([
      { label: "contextMenu", replacedText: "teMenu", tagName: "contextMenu" },
      { label: "items", replacedText: "teMenu", tagName: "items" },
      { label: "swipeContent", replacedText: "teMenu", tagName: "swipeContent" }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Field]);
  });

  it("will get completion values for UI5 xmlns key namespace", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns:u⇶`;
    const suggestions = getSuggestions(xmlSnippet, ui5SemanticModel);
    const suggestionsDetails = map(suggestions, suggestion => ({
      label: suggestion.label,
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range),
      newText: suggestion.textEdit?.newText
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionsDetails).to.deep.equalInAnyOrder([
      {
        label: "unified",
        replacedText: "xmlns:u",
        newText: `xmlns:unified="sap.ui.unified"`
      },
      {
        label: "upload",
        replacedText: "xmlns:u",
        newText: `xmlns:upload="sap.m.upload"`
      },
      {
        label: "util",
        replacedText: "xmlns:u",
        newText: `xmlns:util="sap.ui.core.util"`
      },
      {
        label: "ux3",
        replacedText: "xmlns:u",
        newText: `xmlns:ux3="sap.ui.ux3"`
      },
      {
        label: "uxap",
        replacedText: "xmlns:u",
        newText: `xmlns:uxap="sap.uxap"`
      },
      {
        label: "ubc",
        replacedText: "xmlns:u",
        newText: `xmlns:ubc="sap.gantt.shape.ext.ubc"`
      },
      { label: "ui", replacedText: "xmlns:u", newText: `xmlns:ui="sap.ca.ui"` },
      {
        label: "ui",
        replacedText: "xmlns:u",
        newText: `xmlns:ui="sap.rules.ui"`
      },
      {
        label: "ui5",
        replacedText: "xmlns:u",
        newText: `xmlns:ui5="sap.viz.ui5"`
      },
      {
        label: "ulc",
        replacedText: "xmlns:u",
        newText: `xmlns:ulc="sap.gantt.shape.ext.ulc"`
      }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Module]);
  });

  it("will get completion values for UI5 xmlns key namespace when the cursor is in the middle of a name", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns:ux⇶a`;
    const suggestions = getSuggestions(xmlSnippet, ui5SemanticModel);
    const suggestionsDetails = map(suggestions, suggestion => ({
      label: suggestion.label,
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range),
      newText: suggestion.textEdit?.newText
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionsDetails).to.deep.equalInAnyOrder([
      {
        label: "ux3",
        replacedText: "xmlns:uxa",
        newText: `xmlns:ux3="sap.ui.ux3"`
      },
      {
        label: "uxap",
        replacedText: "xmlns:uxa",
        newText: `xmlns:uxap="sap.uxap"`
      }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Module]);
  });

  it("will get completion values for UI5 xmlns key namespace when the cursor is in the middle of a name and there is a value", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns:ux⇶a="sap.m"`;
    const suggestions = getSuggestions(xmlSnippet, ui5SemanticModel);
    const suggestionsDetails = map(suggestions, suggestion => ({
      label: suggestion.label,
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range),
      newText: suggestion.textEdit?.newText
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionsDetails).to.deep.equalInAnyOrder([
      { label: "ux3", replacedText: "xmlns:uxa", newText: `xmlns:ux3` },
      { label: "uxap", replacedText: "xmlns:uxa", newText: `xmlns:uxap` }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Module]);
  });

  it("will get completion values for UI5 xmlns value namespace", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns:ux3="⇶"`;
    const suggestions = getSuggestions(xmlSnippet, ui5SemanticModel);
    const suggestionsDetails = map(suggestions, suggestion => ({
      label: suggestion.label,
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range),
      newTtext: suggestion.textEdit?.newText
    }));
    expect(suggestionsDetails).to.deep.equalInAnyOrder([
      { label: "ux3", replacedText: `""`, newTtext: `"sap.ui.ux3"` }
    ]);
  });

  it("will get completion values for UI5 xmlns value namespace when the cursor is in the middle of a name", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="ux⇶a"`;
    const suggestions = getSuggestions(xmlSnippet, ui5SemanticModel);
    const suggestionsDetails = map(suggestions, suggestion => ({
      label: suggestion.label,
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range),
      newText: suggestion.textEdit?.newText
    }));
    expect(suggestionsDetails).to.deep.equalInAnyOrder([
      { label: "ux3", replacedText: `"uxa"`, newText: `"sap.ui.ux3"` },
      { label: "uxap", replacedText: `"uxa"`, newText: `"sap.uxap"` }
    ]);
  });

  it("will get completion values for UI5 xmlns value namespace FQN when the cursor is in the middle of a name", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns:uxap="sap.u⇶i"`;
    const suggestions = getSuggestions(xmlSnippet, ui5SemanticModel);
    const suggestionsDetails = map(suggestions, suggestion => ({
      label: suggestion.label,
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range),
      newText: suggestion.textEdit?.newText
    }));
    expect(suggestionsDetails).to.deep.equalInAnyOrder([
      { label: "uxap", replacedText: `"sap.ui"`, newText: `"sap.uxap"` }
    ]);
  });

  it("will get completion values for UI5 enum value", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List showSeparators="⇶"`;
    const suggestions = getSuggestions(xmlSnippet, ui5SemanticModel);
    const suggestionsDetails = map(suggestions, suggestion => ({
      label: suggestion.label,
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range),
      newText: suggestion.textEdit?.newText
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionsDetails).to.deep.equalInAnyOrder([
      { label: "All", replacedText: `""`, newText: `"All"` },
      { label: "Inner", replacedText: `""`, newText: `"Inner"` },
      { label: "None", replacedText: `""`, newText: `"None"` }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.EnumMember]);
  });

  it("will get completion values for UI5 enum value when the cursor is in the middle of a name", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List showSeparators="n⇶ner"`;
    const suggestions = getSuggestions(xmlSnippet, ui5SemanticModel);
    const suggestionsDetails = map(suggestions, suggestion => ({
      label: suggestion.label,
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range),
      newText: suggestion.textEdit?.newText
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionsDetails).to.deep.equalInAnyOrder([
      { label: "Inner", replacedText: `"nner"`, newText: `"Inner"` },
      { label: "None", replacedText: `"nner"`, newText: `"None"` }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.EnumMember]);
  });

  it("will get completion values for UI5 properties, events and associations", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List ⇶`;
    const suggestions = getSuggestions(xmlSnippet, ui5SemanticModel);
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionKinds).to.deep.equalInAnyOrder([
      CompletionItemKind.Property,
      CompletionItemKind.Event,
      CompletionItemKind.Reference
    ]);

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
    const suggestions = getSuggestions(xmlSnippet, ui5SemanticModel);
    expect(suggestions).to.not.be.empty;
    forEach(suggestions, suggestion => {
      // We're not replacing any text, just adding
      expect(getTextInRange(xmlSnippet, suggestion.textEdit?.range)).to.equal(
        ""
      );
    });
  });

  it("will get the lsp completion item kind according to the suggestion type", () => {
    expectLspKind("UI5NamespacesInXMLAttributeKey", CompletionItemKind.Module);
    expectLspKind(
      "UI5NamespacesInXMLAttributeValue",
      CompletionItemKind.Module
    );
    expectLspKind(
      "UI5AssociationsInXMLAttributeKey",
      CompletionItemKind.Reference
    );
    expectLspKind("UI5AggregationsInXMLTagName", CompletionItemKind.Field);
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
});
