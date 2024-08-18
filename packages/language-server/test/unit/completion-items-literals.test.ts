import { map, uniq } from "lodash";
import { CompletionItemKind, TextEdit } from "vscode-languageserver";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import {
  DEFAULT_UI5_VERSION,
  DEFAULT_UI5_FRAMEWORK,
} from "@ui5-language-assistant/constant";
import {
  generateModel,
  getFallbackPatchVersions,
} from "@ui5-language-assistant/test-utils";
import { generate } from "@ui5-language-assistant/semantic-model";
import {
  getDefaultContext,
  getSuggestions,
  getTextInRange,
} from "./completion-items-utils";
import { Context as AppContext } from "@ui5-language-assistant/context";
import "jest-extended";

describe("the UI5 language assistant Code Completion Services", () => {
  let ui5SemanticModel: UI5SemanticModel;
  let appContext: AppContext;
  beforeAll(async () => {
    ui5SemanticModel = await generateModel({
      framework: DEFAULT_UI5_FRAMEWORK,
      version: (
        await getFallbackPatchVersions()
      ).SAPUI5 as typeof DEFAULT_UI5_VERSION,
      modelGenerator: generate,
    });
    appContext = getDefaultContext(ui5SemanticModel);
  });

  it("will get completion values for boolean value", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"
                          busy="⇶">`;
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
      { label: "false", replacedText: `""`, newText: `"false"` },
      { label: "true", replacedText: `""`, newText: `"true"` },
    ]);

    expect(suggestionKinds).toIncludeSameMembers([CompletionItemKind.Constant]);
  });

  it("will get completion values for UI5 boolean value when the cursor is in the middle of a name", () => {
    const xmlSnippet = `<mvc:View 
                          xmlns:mvc="sap.ui.core.mvc" 
                          xmlns="sap.m"
                          busy="t⇶a">`;
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
      { label: "true", replacedText: `"ta"`, newText: `"true"` },
    ]);

    expect(suggestionKinds).toIncludeSameMembers([CompletionItemKind.Constant]);
  });
});
