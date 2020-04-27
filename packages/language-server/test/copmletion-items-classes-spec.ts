import { expect } from "chai";
import { map, uniq, forEach } from "lodash";
import { CompletionItemKind, TextEdit } from "vscode-languageserver";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import {
  generateModel,
  GEN_MODEL_TIMEOUT
} from "@ui5-language-assistant/test-utils";
import {
  getSuggestions,
  getRanges,
  getTextInRange,
  getTagName
} from "./completion-items-utils";

describe("the UI5 language assistant Code Completion Services - classes", () => {
  let ui5SemanticModel: UI5SemanticModel;
  before(async function() {
    this.timeout(GEN_MODEL_TIMEOUT);
    //TODO: use 1.71.x
    ui5SemanticModel = await generateModel({ version: "1.74.0" });
  });

  /** Return the attributes from a tag name suggestion insert text  */
  function getAttributes(textEdit: TextEdit | undefined): string[] {
    if (textEdit === undefined) {
      return [];
    }
    const result = /^[^ ]+ ([^>]+)/.exec(textEdit.newText);
    return result?.[1].split(" ") ?? [];
  }

  it("will get completion values for UI5 class", () => {
    const xmlSnippet = `<GridLi⇶`;
    const suggestions = getSuggestions(xmlSnippet, ui5SemanticModel);
    const suggestionsDetails = map(suggestions, suggestion => ({
      label: suggestion.label,
      tagName: getTagName(suggestion.textEdit),
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range)
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionsDetails).to.deep.equalInAnyOrder([
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
    const suggestions = getSuggestions(xmlSnippet, ui5SemanticModel);
    const suggestionsDetails = map(suggestions, suggestion => ({
      label: suggestion.label,
      tagName: getTagName(suggestion.textEdit),
      firstAttribute: getAttributes(suggestion.textEdit)[0],
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range)
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionsDetails).to.deep.equalInAnyOrder([
      {
        label: "BusyDialog",
        tagName: "m:BusyDialog",
        firstAttribute: `xmlns:m="sap.m"`,
        replacedText: "sap.m.Busy"
      },
      {
        label: "BusyIndicator",
        tagName: "m:BusyIndicator",
        firstAttribute: `xmlns:m="sap.m"`,
        replacedText: "sap.m.Busy"
      }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Class]);
  });

  it("will insert class namespace with a new name when another namespace with the short name is defined", () => {
    const xmlSnippet = `<sap.m.BusyI⇶ xmlns:m="sap.ui.core.mvc"`;
    const suggestions = getSuggestions(xmlSnippet, ui5SemanticModel);
    const suggestionsDetails = map(suggestions, suggestion => ({
      label: suggestion.label,
      tagName: getTagName(suggestion.textEdit),
      firstAttribute: getAttributes(suggestion.textEdit)[0],
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range)
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionsDetails).to.deep.equalInAnyOrder([
      {
        label: "BusyIndicator",
        tagName: "m2:BusyIndicator",
        firstAttribute: `xmlns:m2="sap.m"`,
        replacedText: "sap.m.BusyI"
      }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Class]);
  });

  it("will get completion values for UI5 class when the cursor is in the middle of a name", () => {
    const xmlSnippet = `<Busy⇶Dialo`;
    const suggestions = getSuggestions(xmlSnippet, ui5SemanticModel);
    const suggestionsDetails = map(suggestions, suggestion => ({
      label: suggestion.label,
      tagName: getTagName(suggestion.textEdit),
      firstAttribute: getAttributes(suggestion.textEdit)[0],
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range)
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionsDetails).to.deep.equalInAnyOrder([
      {
        label: "BusyDialog",
        tagName: "m:BusyDialog",
        firstAttribute: `xmlns:m="sap.m"`,
        replacedText: "BusyDialo"
      },
      {
        label: "BusyIndicator",
        tagName: "m:BusyIndicator",
        firstAttribute: `xmlns:m="sap.m"`,
        replacedText: "BusyDialo"
      },
      {
        label: "LocalBusyIndicator",
        tagName: "core:LocalBusyIndicator",
        firstAttribute: `xmlns:core="sap.ui.core"`,
        replacedText: "BusyDialo"
      },
      {
        label: "InboxBusyIndicator",
        tagName: "composite:InboxBusyIndicator",
        firstAttribute: `xmlns:composite="sap.uiext.inbox.composite"`,
        replacedText: "BusyDialo"
      }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Class]);
  });

  it("will get completion values for UI5 class FQN when the cursor is in the middle of a name", () => {
    const xmlSnippet = `<sap.m.Busy⇶Dialo`;
    const suggestions = getSuggestions(xmlSnippet, ui5SemanticModel);
    const suggestionsDetails = map(suggestions, suggestion => ({
      label: suggestion.label,
      tagName: getTagName(suggestion.textEdit),
      firstAttribute: getAttributes(suggestion.textEdit)[0],
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range)
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionsDetails).to.deep.equalInAnyOrder([
      {
        label: "BusyDialog",
        tagName: "m:BusyDialog",
        firstAttribute: `xmlns:m="sap.m"`,
        replacedText: "sap.m.BusyDialo"
      },
      {
        label: "BusyIndicator",
        tagName: "m:BusyIndicator",
        firstAttribute: `xmlns:m="sap.m"`,
        replacedText: "sap.m.BusyDialo"
      }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Class]);
  });

  it("will get completion values for UI5 class with namespace when the cursor is in the middle of a name", () => {
    const xmlSnippet = `<m:Busy⇶Dialo xmlns:m="sap.m"`;
    const suggestions = getSuggestions(xmlSnippet, ui5SemanticModel);
    const suggestionsDetails = map(suggestions, suggestion => ({
      label: suggestion.label,
      tagName: getTagName(suggestion.textEdit),
      attributes: getAttributes(suggestion.textEdit),
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range)
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionsDetails).to.deep.equalInAnyOrder([
      {
        label: "BusyDialog",
        tagName: "m:BusyDialog",
        attributes: [],
        replacedText: "m:BusyDialo"
      },
      {
        label: "BusyIndicator",
        tagName: "m:BusyIndicator",
        attributes: [],
        replacedText: "m:BusyDialo"
      }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Class]);
  });

  it("will get completion values for UI5 class from all namespaces when default namespace exists", () => {
    const xmlSnippet = `<RadioButtonGrou⇶ xmlns="sap.m" xmlns:commons="sap.ui.commons"`;
    const suggestions = getSuggestions(xmlSnippet, ui5SemanticModel);
    const suggestionsDetails = map(suggestions, suggestion => ({
      label: suggestion.label,
      tagName: getTagName(suggestion.textEdit),
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range)
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionsDetails).to.deep.equalInAnyOrder([
      {
        label: "RadioButtonGroup",
        tagName: "RadioButtonGroup",
        replacedText: "RadioButtonGrou"
      },
      {
        label: "RadioButtonGroup",
        tagName: "commons:RadioButtonGroup",
        replacedText: "RadioButtonGrou"
      }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Class]);
  });

  it("will get completion values for UI5 class from a specific namespace", () => {
    const xmlSnippet = `<f:Ca⇶ xmlns:f="sap.f"`;
    const suggestions = getSuggestions(xmlSnippet, ui5SemanticModel);
    const suggestionsDetails = map(suggestions, suggestion => ({
      label: suggestion.label,
      tagName: getTagName(suggestion.textEdit),
      attributes: getAttributes(suggestion.textEdit),
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range)
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionsDetails).to.deep.equalInAnyOrder([
      { label: "Card", tagName: "f:Card", attributes: [], replacedText: "f:Ca" }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Class]);
  });

  it("will get completion values for UI5 class from a specific namespace when name is not the parent name", () => {
    const xmlSnippet = `<g:Ca⇶ xmlns:g="sap.f"`;
    const suggestions = getSuggestions(xmlSnippet, ui5SemanticModel);
    const suggestionsDetails = map(suggestions, suggestion => ({
      label: suggestion.label,
      tagName: getTagName(suggestion.textEdit),
      attributes: getAttributes(suggestion.textEdit),
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range)
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionsDetails).to.deep.equalInAnyOrder([
      { label: "Card", tagName: "g:Card", attributes: [], replacedText: "g:Ca" }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Class]);
  });

  it("will not insert the namespace when selecting completion for class in inner tag and namespace is already defined", () => {
    const xmlSnippet = `<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">
        <content>
          <sap.m.MenuButto⇶n
        </content>
      </m:View>`;
    const suggestions = getSuggestions(xmlSnippet, ui5SemanticModel);
    const suggestionsDetails = map(suggestions, suggestion => ({
      label: suggestion.label,
      tagName: getTagName(suggestion.textEdit),
      additionalTextEdits: suggestion.additionalTextEdits,
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range)
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    expect(suggestionsDetails).to.deep.equalInAnyOrder([
      {
        label: "MenuButton",
        tagName: "m:MenuButton",
        additionalTextEdits: [],
        replacedText: "sap.m.MenuButton"
      }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Class]);
  });

  it("will insert the namespace when selecting completion for class in inner tag and namespace is not defined", () => {
    const xmlSnippet = `<m:View⭲⭰ xmlns:m="sap.ui.core.mvc">
        <content>
          <MenuButton⇶
        </content>
      </m:View>`;
    const suggestions = getSuggestions(xmlSnippet, ui5SemanticModel);
    const suggestionsDetails = map(suggestions, suggestion => ({
      label: suggestion.label,
      tagName: getTagName(suggestion.textEdit),
      additionalTextEdits: suggestion.additionalTextEdits,
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range)
    }));
    const suggestionKinds = uniq(
      map(suggestions, suggestion => suggestion.kind)
    );

    const ranges = getRanges(xmlSnippet);
    expect(ranges, "additional text edits ranges").to.have.lengthOf(1);

    expect(suggestionsDetails).to.deep.equalInAnyOrder([
      {
        label: "MenuButton",
        tagName: "m2:MenuButton",
        additionalTextEdits: [
          {
            range: ranges[0],
            newText: ` xmlns:m2="sap.m"`
          }
        ],
        replacedText: "MenuButton"
      },
      {
        label: "MenuButton",
        tagName: "commons:MenuButton",
        additionalTextEdits: [
          {
            range: ranges[0],
            newText: ` xmlns:commons="sap.ui.commons"`
          }
        ],
        replacedText: "MenuButton"
      }
    ]);

    expect(suggestionKinds).to.deep.equal([CompletionItemKind.Class]);
  });

  it("will not get completion values for unknown class", () => {
    const xmlSnippet = `<Unknown⇶`;
    const suggestions = getSuggestions(xmlSnippet, ui5SemanticModel);
    expect(suggestions).to.be.empty;
  });

  it("will return valid class suggestions for empty tag", () => {
    const xmlSnippet = `<⇶`;
    const suggestions = getSuggestions(xmlSnippet, ui5SemanticModel);
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
    const suggestions = getSuggestions(xmlSnippet, ui5SemanticModel);
    const suggestionsDetails = map(suggestions, suggestion => ({
      label: suggestion.label,
      tagName: getTagName(suggestion.textEdit),
      replacedText: getTextInRange(xmlSnippet, suggestion.textEdit?.range)
    }));
    expect(suggestionsDetails).to.deep.equalInAnyOrder([
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
});
