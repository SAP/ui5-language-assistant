import { expect } from "chai";
import { map, uniq } from "lodash";
import { CompletionItemKind } from "vscode-languageserver";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { generateModel } from "@ui5-language-assistant/test-utils";
import { getSuggestions, getTextInRange } from "./completion-items-utils";

describe("the UI5 language assistant Code Completion Services", () => {
  let ui5SemanticModel: UI5SemanticModel;
  before(async () => {
    //TODO: use 1.71.x
    ui5SemanticModel = await generateModel({ version: "1.74.0" });
  });

  it("will get completion values for boolean value", async () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"
                          busy="⇶">`;
    const suggestions = await getSuggestions(xmlSnippet, ui5SemanticModel);
    const suggestionsDetails = map(suggestions, (suggestion) => ({
      label: suggestion.label,
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range),
      newText: suggestion.textEdit?.newText,
    }));
    const suggestionKinds = uniq(
      map(suggestions, (suggestion) => suggestion.kind)
    );

    expect(suggestionsDetails).to.deep.equalInAnyOrder([
      { label: "false", replacedText: `""`, newText: `"false"` },
      { label: "true", replacedText: `""`, newText: `"true"` },
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Constant]);
  });

  it("will get completion values for UI5 boolean value when the cursor is in the middle of a name", async () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"
                          busy="t⇶a">`;
    const suggestions = await getSuggestions(xmlSnippet, ui5SemanticModel);
    const suggestionsDetails = map(suggestions, (suggestion) => ({
      label: suggestion.label,
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range),
      newText: suggestion.textEdit?.newText,
    }));
    const suggestionKinds = uniq(
      map(suggestions, (suggestion) => suggestion.kind)
    );

    expect(suggestionsDetails).to.deep.equalInAnyOrder([
      { label: "true", replacedText: `"ta"`, newText: `"true"` },
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Constant]);
  });

  it("will return true and false when settings don't allow deprecated and experimental APIs", async () => {
    it("will not return deprecated suggestions according to settings", async () => {
      const NO_DEPRECATED_OR_EXPERIMENTAL = {
        codeAssist: { deprecated: false, experimental: false },
      };
      const xmlSnippet = `
        <mvc:View 
          xmlns:mvc="sap.ui.core.mvc" 
          xmlns="sap.m"
          busy="⇶">`;
      const suggestions = await getSuggestions(
        xmlSnippet,
        ui5SemanticModel,
        NO_DEPRECATED_OR_EXPERIMENTAL
      );
      const suggestionNames = map(suggestions, (_) => _.label);
      expect(suggestionNames).to.deep.equalInAnyOrder(["true", "false"]);
    });
  });
});
