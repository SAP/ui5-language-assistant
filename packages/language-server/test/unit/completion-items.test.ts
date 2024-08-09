import { map, uniq, forEach, filter } from "lodash";
import { CompletionItemKind, TextEdit } from "vscode-languageserver";
import { UI5XMLViewCompletion } from "@ui5-language-assistant/xml-views-completion";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { DEFAULT_UI5_VERSION } from "@ui5-language-assistant/constant";
import { Settings } from "@ui5-language-assistant/settings";
import {
  generateModel,
  getFallbackPatchVersions,
} from "@ui5-language-assistant/test-utils";
import { generate } from "@ui5-language-assistant/semantic-model";
import { computeLSPKind } from "../../src/completion-items";
import {
  getSuggestions,
  getTextInRange,
  getTagName,
  getRanges,
  getDefaultContext,
} from "./completion-items-utils";
import { Context as AppContext } from "@ui5-language-assistant/context";
import "jest-extended";

describe("the UI5 language assistant Code Completion Services", () => {
  // Cursor position after selecting the suggestion
  const CURSOR_POSITION = "${0}";

  // Pre-selected snippet text
  function SELECTED_TEXT(text: string): string {
    return `\${0:${text}}`;
  }

  let ui5SemanticModel: UI5SemanticModel;
  let appContext: AppContext;
  beforeAll(async () => {
    ui5SemanticModel = await generateModel({
      framework: "SAPUI5",
      version: (
        await getFallbackPatchVersions()
      ).SAPUI5 as typeof DEFAULT_UI5_VERSION,
      modelGenerator: generate,
    });
    appContext = getDefaultContext(ui5SemanticModel);
  });

  it("no completion items for empty file - no error", () => {
    const xmlSnippet = `⇶`;
    const suggestions = getSuggestions(xmlSnippet, appContext);
    expect(suggestions).toStrictEqual([]);
  });

  it("will get completion values for UI5 property", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List show⇶`;
    const suggestions = getSuggestions(xmlSnippet, appContext);
    const suggestionsDetails = map(suggestions, (suggestion) => ({
      label: suggestion.label,
      replacedText: getTextInRange(
        xmlSnippet,
        (suggestion.textEdit as TextEdit)?.range
      ),
    }));
    const suggestionKinds = uniq(
      map(suggestions, (suggestion) => suggestion.kind)
    );

    expect(suggestionsDetails).toIncludeSameMembers([
      { label: "showNoData", replacedText: "show" },
      { label: "showSeparators", replacedText: "show" },
      { label: "showUnread", replacedText: "show" },
    ]);

    expect(suggestionKinds).toIncludeSameMembers([CompletionItemKind.Property]);
  });

  it("will get completion values for UI5 property with default value when the cursor is in the middle of a name", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List show⇶Separ`;
    const suggestions = getSuggestions(xmlSnippet, appContext);
    const suggestionsDetails = map(suggestions, (suggestion) => ({
      label: suggestion.label,
      replacedText: getTextInRange(
        xmlSnippet,
        (suggestion.textEdit as TextEdit)?.range
      ),
      newText: suggestion.textEdit?.newText,
    }));
    const suggestionKinds = uniq(
      map(suggestions, (suggestion) => suggestion.kind)
    );

    expect(suggestionsDetails).toIncludeSameMembers([
      {
        label: "showNoData",
        replacedText: "showSepar",
        newText: `showNoData="${SELECTED_TEXT("true")}"`,
      },
      {
        label: "showSeparators",
        replacedText: "showSepar",
        newText: `showSeparators="${SELECTED_TEXT("All")}"`,
      },
      {
        label: "showUnread",
        replacedText: "showSepar",
        newText: `showUnread="${SELECTED_TEXT("false")}"`,
      },
    ]);

    expect(suggestionKinds).toIncludeSameMembers([CompletionItemKind.Property]);
  });

  it("will get completion values for UI5 property when the cursor is in the middle of a name and there is a value", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List show⇶Separ="true"`;
    const suggestions = getSuggestions(xmlSnippet, appContext);
    const suggestionsDetails = map(suggestions, (suggestion) => ({
      label: suggestion.label,
      replacedText: getTextInRange(
        xmlSnippet,
        (suggestion.textEdit as TextEdit)?.range
      ),
      newText: suggestion.textEdit?.newText,
    }));
    const suggestionKinds = uniq(
      map(suggestions, (suggestion) => suggestion.kind)
    );

    expect(suggestionsDetails).toIncludeSameMembers([
      { label: "showNoData", replacedText: "showSepar", newText: "showNoData" },
      {
        label: "showSeparators",
        replacedText: "showSepar",
        newText: "showSeparators",
      },
      { label: "showUnread", replacedText: "showSepar", newText: "showUnread" },
    ]);

    expect(suggestionKinds).toIncludeSameMembers([CompletionItemKind.Property]);
  });

  it("will get completion values for UI5 event", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List update⇶`;
    const suggestions = getSuggestions(xmlSnippet, appContext);
    const suggestionsDetails = map(suggestions, (suggestion) => ({
      label: suggestion.label,
      replacedText: getTextInRange(
        xmlSnippet,
        (suggestion.textEdit as TextEdit)?.range
      ),
      newText: suggestion.textEdit?.newText,
    }));
    const suggestionKinds = uniq(
      map(suggestions, (suggestion) => suggestion.kind)
    );

    expect(suggestionsDetails).toIncludeSameMembers([
      {
        label: "updateFinished",
        replacedText: "update",
        newText: `updateFinished="${CURSOR_POSITION}"`,
      },
      {
        label: "updateStarted",
        replacedText: "update",
        newText: `updateStarted="${CURSOR_POSITION}"`,
      },
    ]);

    expect(suggestionKinds).toIncludeSameMembers([CompletionItemKind.Event]);
  });

  it("will get completion values for UI5 event when the cursor is in the middle of a name and there is an attribute value", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List update⇶Start="onUpdateStart"`;
    const suggestions = getSuggestions(xmlSnippet, appContext);
    const suggestionsDetails = map(suggestions, (suggestion) => ({
      label: suggestion.label,
      replacedText: getTextInRange(
        xmlSnippet,
        (suggestion.textEdit as TextEdit)?.range
      ),
      newText: suggestion.textEdit?.newText,
    }));
    const suggestionKinds = uniq(
      map(suggestions, (suggestion) => suggestion.kind)
    );

    expect(suggestionsDetails).toIncludeSameMembers([
      {
        label: "updateFinished",
        replacedText: "updateStart",
        newText: "updateFinished",
      },
      {
        label: "updateStarted",
        replacedText: "updateStart",
        newText: "updateStarted",
      },
    ]);

    expect(suggestionKinds).toIncludeSameMembers([CompletionItemKind.Event]);
  });

  it("will get completion values for UI5 association", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List aria⇶`;
    const suggestions = getSuggestions(xmlSnippet, appContext);
    const suggestionsDetails = map(suggestions, (suggestion) => ({
      label: suggestion.label,
      replacedText: getTextInRange(
        xmlSnippet,
        (suggestion.textEdit as TextEdit)?.range
      ),
    }));
    const suggestionKinds = uniq(
      map(suggestions, (suggestion) => suggestion.kind)
    );

    expect(suggestionsDetails).toIncludeSameMembers([
      {
        label: "ariaLabelledBy",
        replacedText: "aria",
      },
    ]);

    expect(suggestionKinds).toIncludeSameMembers([
      CompletionItemKind.Reference,
    ]);
  });

  it("will get completion values for UI5 association when the cursor is in the middle of a name", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List aria⇶bbbb`;
    const suggestions = getSuggestions(xmlSnippet, appContext);
    const suggestionsDetails = map(suggestions, (suggestion) => ({
      label: suggestion.label,
      replacedText: getTextInRange(
        xmlSnippet,
        (suggestion.textEdit as TextEdit)?.range
      ),
    }));
    const suggestionKinds = uniq(
      map(suggestions, (suggestion) => suggestion.kind)
    );

    expect(suggestionsDetails).toIncludeSameMembers([
      {
        label: "ariaLabelledBy",
        replacedText: "ariabbbb",
      },
    ]);

    expect(suggestionKinds).toIncludeSameMembers([
      CompletionItemKind.Reference,
    ]);
  });

  it("will get completion values for UI5 aggregation in the default namespace", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List> <te⇶`;
    const suggestions = filter(
      getSuggestions(xmlSnippet, appContext),
      (suggestion) => suggestion.kind === CompletionItemKind.Field
    );
    const suggestionsDetails = map(suggestions, (suggestion) => ({
      label: suggestion.label,
      tagName: getTagName(suggestion.textEdit as TextEdit),
      replacedText: getTextInRange(
        xmlSnippet,
        (suggestion.textEdit as TextEdit)?.range
      ),
    }));
    const suggestionKinds = uniq(
      map(suggestions, (suggestion) => suggestion.kind)
    );

    expect(suggestionsDetails).toIncludeSameMembers([
      { label: "contextMenu", tagName: "contextMenu", replacedText: "te" },
      { label: "items", tagName: "items", replacedText: "te" },
      { label: "swipeContent", tagName: "swipeContent", replacedText: "te" },
    ]);

    expect(suggestionKinds).toIncludeSameMembers([CompletionItemKind.Field]);
  });

  it("will get completion values for UI5 aggregation in a non-default namespace", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns:m="sap.m"> 
                          <m:List> <te⇶`;
    const suggestions = filter(
      getSuggestions(xmlSnippet, appContext),
      (suggestion) => suggestion.kind === CompletionItemKind.Field
    );
    const suggestionsDetails = map(suggestions, (suggestion) => ({
      label: suggestion.label,
      tagName: getTagName(suggestion.textEdit as TextEdit),
      replacedText: getTextInRange(
        xmlSnippet,
        (suggestion.textEdit as TextEdit)?.range
      ),
    }));
    const suggestionKinds = uniq(
      map(suggestions, (suggestion) => suggestion.kind)
    );

    expect(suggestionsDetails).toIncludeSameMembers([
      { label: "contextMenu", tagName: "m:contextMenu", replacedText: "te" },
      { label: "items", tagName: "m:items", replacedText: "te" },
      { label: "swipeContent", tagName: "m:swipeContent", replacedText: "te" },
    ]);

    expect(suggestionKinds).toIncludeSameMembers([CompletionItemKind.Field]);
  });

  it("will get completion values for UI5 aggregation when the cursor is in the middle of a name in the default namespace", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List> <te⇶Menu`;
    const suggestions = filter(
      getSuggestions(xmlSnippet, appContext),
      (suggestion) => suggestion.kind === CompletionItemKind.Field
    );
    const suggestionsDetails = map(suggestions, (suggestion) => ({
      label: suggestion.label,
      replacedText: getTextInRange(
        xmlSnippet,
        (suggestion.textEdit as TextEdit)?.range
      ),
      tagName: getTagName(suggestion.textEdit as TextEdit),
    }));
    const suggestionKinds = uniq(
      map(suggestions, (suggestion) => suggestion.kind)
    );

    expect(suggestionsDetails).toIncludeSameMembers([
      { label: "contextMenu", replacedText: "teMenu", tagName: "contextMenu" },
      { label: "items", replacedText: "teMenu", tagName: "items" },
      {
        label: "swipeContent",
        replacedText: "teMenu",
        tagName: "swipeContent",
      },
    ]);

    expect(suggestionKinds).toIncludeSameMembers([CompletionItemKind.Field]);
  });

  it("will get completion values for UI5 aggregation when the cursor is in the middle of a name in a non-default namespace", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns:m="sap.m"> 
                          <m:List> <te⇶Menu`;
    const suggestions = filter(
      getSuggestions(xmlSnippet, appContext),
      (suggestion) => suggestion.kind === CompletionItemKind.Field
    );
    const suggestionsDetails = map(suggestions, (suggestion) => ({
      label: suggestion.label,
      replacedText: getTextInRange(
        xmlSnippet,
        (suggestion.textEdit as TextEdit)?.range
      ),
      tagName: getTagName(suggestion.textEdit as TextEdit),
    }));
    const suggestionKinds = uniq(
      map(suggestions, (suggestion) => suggestion.kind)
    );

    expect(suggestionsDetails).toIncludeSameMembers([
      {
        label: "contextMenu",
        replacedText: "teMenu",
        tagName: "m:contextMenu",
      },
      { label: "items", replacedText: "teMenu", tagName: "m:items" },
      {
        label: "swipeContent",
        replacedText: "teMenu",
        tagName: "m:swipeContent",
      },
    ]);

    expect(suggestionKinds).toIncludeSameMembers([CompletionItemKind.Field]);
  });

  it("will replace the aggregation closing tag name when the tag is closed and has the same name as the opening tag in the default namespace", () => {
    const xmlSnippet = `<mvc:View 
        xmlns:mvc="sap.ui.core.mvc"
        xmlns="sap.m">
      <List>
        <te⇶></⭲te⭰>
      </List>
    </mvc:View>`;
    const suggestions = filter(
      getSuggestions(xmlSnippet, appContext),
      (suggestion) => suggestion.kind === CompletionItemKind.Field
    );
    const suggestionsDetails = map(suggestions, (suggestion) => ({
      label: suggestion.label,
      tagName: getTagName(suggestion.textEdit as TextEdit),
      additionalTextEdits: suggestion.additionalTextEdits,
      replacedText: getTextInRange(
        xmlSnippet,
        (suggestion.textEdit as TextEdit)?.range
      ),
    }));
    const suggestionKinds = uniq(
      map(suggestions, (suggestion) => suggestion.kind)
    );

    const ranges = getRanges(xmlSnippet);
    expect(ranges.length).toBe(1);

    expect(suggestionsDetails).toIncludeSameMembers([
      {
        label: "contextMenu",
        tagName: "contextMenu",
        additionalTextEdits: [
          {
            range: ranges[0],
            newText: `contextMenu`,
          },
        ],
        replacedText: "te",
      },
      {
        label: "items",
        tagName: "items",
        additionalTextEdits: [
          {
            range: ranges[0],
            newText: `items`,
          },
        ],
        replacedText: "te",
      },
      {
        label: "swipeContent",
        tagName: "swipeContent",
        additionalTextEdits: [
          {
            range: ranges[0],
            newText: `swipeContent`,
          },
        ],
        replacedText: "te",
      },
    ]);

    expect(suggestionKinds).toIncludeSameMembers([CompletionItemKind.Field]);
  });

  it("will replace the aggregation closing tag name when the tag is closed and has the same name as the opening tag in a non-default namespace", () => {
    const xmlSnippet = `<mvc:View 
        xmlns:mvc="sap.ui.core.mvc"
        xmlns:m="sap.m">
      <m:List>
        <m:te⇶></⭲m:te⭰>
      </m:List>
    </mvc:View>`;
    const suggestions = filter(
      getSuggestions(xmlSnippet, appContext),
      (suggestion) => suggestion.kind === CompletionItemKind.Field
    );
    const suggestionsDetails = map(suggestions, (suggestion) => ({
      label: suggestion.label,
      tagName: getTagName(suggestion.textEdit as TextEdit),
      additionalTextEdits: suggestion.additionalTextEdits,
      replacedText: getTextInRange(
        xmlSnippet,
        (suggestion.textEdit as TextEdit)?.range
      ),
    }));
    const suggestionKinds = uniq(
      map(suggestions, (suggestion) => suggestion.kind)
    );

    const ranges = getRanges(xmlSnippet);
    expect(ranges.length).toBe(1);

    expect(suggestionsDetails).toIncludeSameMembers([
      {
        label: "contextMenu",
        tagName: "contextMenu",
        additionalTextEdits: [
          {
            range: ranges[0],
            newText: `m:contextMenu`,
          },
        ],
        replacedText: "m:te",
      },
      {
        label: "items",
        tagName: "items",
        additionalTextEdits: [
          {
            range: ranges[0],
            newText: `m:items`,
          },
        ],
        replacedText: "m:te",
      },
      {
        label: "swipeContent",
        tagName: "swipeContent",
        additionalTextEdits: [
          {
            range: ranges[0],
            newText: `m:swipeContent`,
          },
        ],
        replacedText: "m:te",
      },
    ]);

    expect(suggestionKinds).toIncludeSameMembers([CompletionItemKind.Field]);
  });

  it("will not replace the aggregation closing tag name when the tag is closed and has a different name from the opening tag", () => {
    const xmlSnippet = `<mvc:View 
        xmlns:mvc="sap.ui.core.mvc"
        xmlns="sap.m">
      <List>
        <te⇶></aaa>
      </List>
    </mvc:View>`;
    const suggestions = filter(
      getSuggestions(xmlSnippet, appContext),
      (suggestion) => suggestion.kind === CompletionItemKind.Field
    );
    const suggestionsDetails = map(suggestions, (suggestion) => ({
      label: suggestion.label,
      tagName: getTagName(suggestion.textEdit as TextEdit),
      additionalTextEdits: suggestion.additionalTextEdits,
      replacedText: getTextInRange(
        xmlSnippet,
        (suggestion.textEdit as TextEdit)?.range
      ),
    }));
    const suggestionKinds = uniq(
      map(suggestions, (suggestion) => suggestion.kind)
    );

    const ranges = getRanges(xmlSnippet);
    expect(ranges.length).toBe(0);

    expect(suggestionsDetails).toIncludeSameMembers([
      {
        label: "contextMenu",
        tagName: "contextMenu",
        additionalTextEdits: [],
        replacedText: "te",
      },
      {
        label: "items",
        tagName: "items",
        additionalTextEdits: [],
        replacedText: "te",
      },
      {
        label: "swipeContent",
        tagName: "swipeContent",
        additionalTextEdits: [],
        replacedText: "te",
      },
    ]);

    expect(suggestionKinds).toIncludeSameMembers([CompletionItemKind.Field]);
  });

  it("will replace the aggregation closing tag name when the tag is closed and does not have a name", () => {
    const xmlSnippet = `<mvc:View 
        xmlns:mvc="sap.ui.core.mvc"
        xmlns="sap.m">
      <List>
        <te⇶>⭲</>⭰
      </List>
    </mvc:View>`;
    const suggestions = filter(
      getSuggestions(xmlSnippet, appContext),
      (suggestion) => suggestion.kind === CompletionItemKind.Field
    );
    const suggestionsDetails = map(suggestions, (suggestion) => ({
      label: suggestion.label,
      tagName: getTagName(suggestion.textEdit as TextEdit),
      additionalTextEdits: suggestion.additionalTextEdits,
      replacedText: getTextInRange(
        xmlSnippet,
        (suggestion.textEdit as TextEdit)?.range
      ),
    }));
    const suggestionKinds = uniq(
      map(suggestions, (suggestion) => suggestion.kind)
    );

    const ranges = getRanges(xmlSnippet);
    expect(ranges.length).toBe(1);

    expect(suggestionsDetails).toIncludeSameMembers([
      {
        label: "contextMenu",
        tagName: "contextMenu",
        additionalTextEdits: [
          {
            range: ranges[0],
            newText: `</contextMenu>`,
          },
        ],
        replacedText: "te",
      },
      {
        label: "items",
        tagName: "items",
        additionalTextEdits: [
          {
            range: ranges[0],
            newText: `</items>`,
          },
        ],
        replacedText: "te",
      },
      {
        label: "swipeContent",
        tagName: "swipeContent",
        additionalTextEdits: [
          {
            range: ranges[0],
            newText: `</swipeContent>`,
          },
        ],
        replacedText: "te",
      },
    ]);

    expect(suggestionKinds).toIncludeSameMembers([CompletionItemKind.Field]);
  });

  it("will get completion values for UI5 xmlns key namespace", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns:u⇶`;
    const suggestions = getSuggestions(xmlSnippet, appContext);
    const suggestionsDetails = map(suggestions, (suggestion) => ({
      label: suggestion.label,
      replacedText: getTextInRange(
        xmlSnippet,
        (suggestion.textEdit as TextEdit)?.range
      ),
      newText: suggestion.textEdit?.newText,
    }));
    const suggestionKinds = uniq(
      map(suggestions, (suggestion) => suggestion.kind)
    );

    expect(suggestionsDetails).toIncludeSameMembers([
      {
        label: "unified",
        replacedText: "xmlns:u",
        newText: `xmlns:unified="sap.ui.unified"`,
      },
      {
        label: "upload",
        replacedText: "xmlns:u",
        newText: `xmlns:upload="sap.m.upload"`,
      },
      {
        label: "util",
        replacedText: "xmlns:u",
        newText: `xmlns:util="sap.ui.core.util"`,
      },
      {
        label: "ux3",
        replacedText: "xmlns:u",
        newText: `xmlns:ux3="sap.ui.ux3"`,
      },
      {
        label: "uxap",
        replacedText: "xmlns:u",
        newText: `xmlns:uxap="sap.uxap"`,
      },
      {
        label: "ubc",
        replacedText: "xmlns:u",
        newText: `xmlns:ubc="sap.gantt.shape.ext.ubc"`,
      },
      { label: "ui", replacedText: "xmlns:u", newText: `xmlns:ui="sap.ca.ui"` },
      {
        label: "ui",
        replacedText: "xmlns:u",
        newText: `xmlns:ui="sap.rules.ui"`,
      },
      {
        label: "ui5",
        replacedText: "xmlns:u",
        newText: `xmlns:ui5="sap.viz.ui5"`,
      },
      {
        label: "ulc",
        replacedText: "xmlns:u",
        newText: `xmlns:ulc="sap.gantt.shape.ext.ulc"`,
      },
    ]);

    expect(suggestionKinds).toIncludeSameMembers([CompletionItemKind.Module]);
  });

  it("will get completion values for UI5 xmlns key namespace when the cursor is in the middle of a name", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns:ux⇶a`;
    const suggestions = getSuggestions(xmlSnippet, appContext);
    const suggestionsDetails = map(suggestions, (suggestion) => ({
      label: suggestion.label,
      replacedText: getTextInRange(
        xmlSnippet,
        (suggestion.textEdit as TextEdit)?.range
      ),
      newText: suggestion.textEdit?.newText,
    }));
    const suggestionKinds = uniq(
      map(suggestions, (suggestion) => suggestion.kind)
    );

    expect(suggestionsDetails).toIncludeSameMembers([
      {
        label: "ux3",
        replacedText: "xmlns:uxa",
        newText: `xmlns:ux3="sap.ui.ux3"`,
      },
      {
        label: "uxap",
        replacedText: "xmlns:uxa",
        newText: `xmlns:uxap="sap.uxap"`,
      },
    ]);

    expect(suggestionKinds).toIncludeSameMembers([CompletionItemKind.Module]);
  });

  it("will get completion values for UI5 xmlns key namespace when the cursor is in the middle of a name and there is a value", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns:ux⇶a="sap.m"`;
    const suggestions = getSuggestions(xmlSnippet, appContext);
    const suggestionsDetails = map(suggestions, (suggestion) => ({
      label: suggestion.label,
      replacedText: getTextInRange(
        xmlSnippet,
        (suggestion.textEdit as TextEdit)?.range
      ),
      newText: suggestion.textEdit?.newText,
    }));
    const suggestionKinds = uniq(
      map(suggestions, (suggestion) => suggestion.kind)
    );

    expect(suggestionsDetails).toIncludeSameMembers([
      { label: "ux3", replacedText: "xmlns:uxa", newText: `xmlns:ux3` },
      { label: "uxap", replacedText: "xmlns:uxa", newText: `xmlns:uxap` },
    ]);

    expect(suggestionKinds).toIncludeSameMembers([CompletionItemKind.Module]);
  });

  it("will get completion values for UI5 xmlns value namespace", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns:ux3="⇶"`;
    const suggestions = getSuggestions(xmlSnippet, appContext);
    const suggestionsDetails = map(suggestions, (suggestion) => ({
      label: suggestion.label,
      replacedText: getTextInRange(
        xmlSnippet,
        (suggestion.textEdit as TextEdit)?.range
      ),
      newTtext: suggestion.textEdit?.newText,
    }));
    expect(suggestionsDetails).toIncludeSameMembers([
      { label: "ux3", replacedText: `""`, newTtext: `"sap.ui.ux3"` },
    ]);
  });

  it("will get completion values for UI5 xmlns value namespace when the cursor is in the middle of a name", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="ux⇶a"`;
    const suggestions = getSuggestions(xmlSnippet, appContext);
    const suggestionsDetails = map(suggestions, (suggestion) => ({
      label: suggestion.label,
      replacedText: getTextInRange(
        xmlSnippet,
        (suggestion.textEdit as TextEdit)?.range
      ),
      newText: suggestion.textEdit?.newText,
    }));
    expect(suggestionsDetails).toIncludeSameMembers([
      { label: "ux3", replacedText: `"uxa"`, newText: `"sap.ui.ux3"` },
      { label: "uxap", replacedText: `"uxa"`, newText: `"sap.uxap"` },
    ]);
  });

  it("will get completion values for UI5 xmlns value namespace FQN when the cursor is in the middle of a name", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns:uxap="sap.u⇶i"`;
    const suggestions = getSuggestions(xmlSnippet, appContext);
    const suggestionsDetails = map(suggestions, (suggestion) => ({
      label: suggestion.label,
      replacedText: getTextInRange(
        xmlSnippet,
        (suggestion.textEdit as TextEdit)?.range
      ),
      newText: suggestion.textEdit?.newText,
    }));
    expect(suggestionsDetails).toIncludeSameMembers([
      { label: "uxap", replacedText: `"sap.ui"`, newText: `"sap.uxap"` },
    ]);
  });

  it("will get completion values for UI5 enum value", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List showSeparators="⇶"`;
    const suggestions = getSuggestions(xmlSnippet, appContext).filter(
      (i) => i.kind !== CompletionItemKind.Snippet
    );
    const suggestionsDetails = map(suggestions, (suggestion) => ({
      label: suggestion.label,
      replacedText: getTextInRange(
        xmlSnippet,
        (suggestion.textEdit as TextEdit)?.range
      ),
      newText: suggestion.textEdit?.newText,
    }));
    const suggestionKinds = uniq(
      map(suggestions, (suggestion) => suggestion.kind)
    );

    expect(suggestionsDetails).toIncludeSameMembers([
      { label: "All", replacedText: `""`, newText: `"All"` },
      { label: "Inner", replacedText: `""`, newText: `"Inner"` },
      { label: "None", replacedText: `""`, newText: `"None"` },
    ]);

    expect(suggestionKinds).toIncludeSameMembers([
      CompletionItemKind.EnumMember,
    ]);
  });

  it("will get completion values for UI5 enum value when the cursor is in the middle of a name", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List showSeparators="n⇶ner"`;
    const suggestions = getSuggestions(xmlSnippet, appContext);
    const suggestionsDetails = map(suggestions, (suggestion) => ({
      label: suggestion.label,
      replacedText: getTextInRange(
        xmlSnippet,
        (suggestion.textEdit as TextEdit)?.range
      ),
      newText: suggestion.textEdit?.newText,
    }));
    const suggestionKinds = uniq(
      map(suggestions, (suggestion) => suggestion.kind)
    );

    expect(suggestionsDetails).toIncludeSameMembers([
      { label: "Inner", replacedText: `"nner"`, newText: `"Inner"` },
      { label: "None", replacedText: `"nner"`, newText: `"None"` },
    ]);

    expect(suggestionKinds).toIncludeSameMembers([
      CompletionItemKind.EnumMember,
    ]);
  });

  it("will get completion values for UI5 properties, events and associations", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"> 
                          <List ⇶`;
    const suggestions = getSuggestions(xmlSnippet, appContext);
    const suggestionKinds = uniq(
      map(suggestions, (suggestion) => suggestion.kind)
    );

    expect(suggestionKinds).toIncludeSameMembers([
      CompletionItemKind.Property,
      CompletionItemKind.Event,
      CompletionItemKind.Reference,
    ]);

    forEach(suggestions, (suggestion) => {
      // We're not replacing any text, just adding
      expect(
        getTextInRange(xmlSnippet, (suggestion.textEdit as TextEdit)?.range)
      ).toEqual("");
    });
  });

  it("will return valid aggregation suggestions for empty tag", () => {
    const xmlSnippet = `<mvc:View xmlns:mvc="sap.ui.core.mvc">
      <⇶
    </mvc:View>`;
    const suggestions = getSuggestions(xmlSnippet, appContext);
    expect(suggestions).not.toBeEmpty();
    forEach(suggestions, (suggestion) => {
      // We're not replacing any text, just adding
      expect(
        getTextInRange(xmlSnippet, (suggestion.textEdit as TextEdit)?.range)
      ).toEqual("");
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
    expectLspKind(
      "BooleanValueInXMLAttributeValue",
      CompletionItemKind.Constant
    );
    expectLspKind("UI5UnknownKey", CompletionItemKind.Text);
  });

  describe("settings", () => {
    const NO_EXPERIMENTAL_SUGGESTIONS = {
      codeAssist: { deprecated: true, experimental: false },
    };
    const NO_DEPRECATED_SUGGESTIONS = {
      codeAssist: { deprecated: false, experimental: true },
    };

    function testSettingsFilter({
      xmlSnippet,
      suggestionLabel,
      settings,
    }: {
      xmlSnippet: string;
      suggestionLabel: string;
      settings: Partial<Settings>;
    }): void {
      const ALLOW_ALL_SUGGESTIONS = {
        codeAssist: { deprecated: true, experimental: true },
      };

      // Check that it's returned when settings allow experimental
      const suggestionsAllAllowed = getSuggestions(
        xmlSnippet,
        appContext,
        ALLOW_ALL_SUGGESTIONS
      );
      const suggestionNamesWithAllAllowed = map(
        suggestionsAllAllowed,
        (_) => _.label
      );
      expect(suggestionNamesWithAllAllowed).toIncludeAllMembers([
        suggestionLabel,
      ]);

      // Check that it's not returned when settings don't allow experimental
      const suggestionsWithSentSettings = getSuggestions(
        xmlSnippet,
        appContext,
        settings
      );
      const suggestionNamesWithSentSettings = map(
        suggestionsWithSentSettings,
        (_) => _.label
      );
      expect(suggestionNamesWithSentSettings).not.toIncludeAnyMembers([
        suggestionLabel,
      ]);
    }

    it("will not return experimental property suggestions according to settings", () => {
      testSettingsFilter({
        xmlSnippet: `
          <mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:widgets="sap.ui.integration.widgets">
            <mvc:content>
              <widgets:Card dataMode⇶
            </mvc:content>
          </m:View>`,
        suggestionLabel: "dataMode",
        settings: NO_EXPERIMENTAL_SUGGESTIONS,
      });
    });

    it("will not return deprecated property suggestions according to settings", () => {
      testSettingsFilter({
        xmlSnippet: `
          <mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">
            <mvc:content>
              <m:Page icon⇶
            </mvc:content>
          </m:View>`,
        suggestionLabel: "icon",
        settings: NO_DEPRECATED_SUGGESTIONS,
      });
    });
  });

  function expectLspKind(
    suggestionType: string,
    expectedKind: CompletionItemKind
  ): void {
    const suggestion = { type: suggestionType } as UI5XMLViewCompletion;
    const lspKind = computeLSPKind(suggestion);
    expect(lspKind).toEqual(expectedKind);
  }
});
