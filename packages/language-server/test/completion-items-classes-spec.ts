import { expect } from "chai";
import { map, forEach } from "lodash";
import {
  CompletionItemKind,
  TextEdit,
  CompletionItem,
} from "vscode-languageserver";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import {
  generateModel,
  expectExists,
} from "@ui5-language-assistant/test-utils";
import {
  getSuggestions,
  getRanges,
  getTextInRange,
  getTagName,
} from "./completion-items-utils";

describe("the UI5 language assistant Code Completion Services - classes", () => {
  let ui5SemanticModel: UI5SemanticModel;
  before(async function () {
    //TODO: use 1.71.x
    ui5SemanticModel = await generateModel({ version: "1.74.0" });
  });

  /** The first (but not final) place the custor stops when inserting the completion. Pressing tab moves it to the next place. */
  const TAB_STOP1 = "${1}";

  interface ClassCompletionItem {
    label: string;
    tagName: string;
    additionalTextEdits?: { rangeIndex: number; newText: string }[];
    replacedText: string;
    attributes?: string[];
  }
  async function assertClassesCompletions(opts: {
    xmlSnippet: string;
    expected: ClassCompletionItem[];
    compareAttributes?: boolean;
  }): Promise<CompletionItem[]> {
    const compareAttributes = opts.compareAttributes ?? true;
    const suggestions = await getSuggestions(opts.xmlSnippet, ui5SemanticModel);
    const ranges = getRanges(opts.xmlSnippet);

    const suggestionsDetails = map(suggestions, (suggestion) => ({
      label: suggestion.label,
      tagName: getTagName(suggestion.textEdit),
      attributes: compareAttributes
        ? getAttributes(suggestion.textEdit)
        : undefined,
      additionalTextEdits: suggestion.additionalTextEdits,
      replacedText: getTextInRange(opts.xmlSnippet, suggestion.textEdit?.range),
      kind: suggestion.kind,
    }));

    const expectedSuggestionsDetails = map(
      opts.expected,
      (expectedSuggestion) => ({
        kind: CompletionItemKind.Class,
        ...expectedSuggestion,
        additionalTextEdits: map(
          expectedSuggestion.additionalTextEdits ?? [],
          (edit) => ({
            range: ranges[edit.rangeIndex],
            newText: edit.newText,
          })
        ),
        attributes: compareAttributes
          ? expectedSuggestion.attributes || []
          : undefined,
      })
    );

    expect(suggestionsDetails).to.deep.equalInAnyOrder(
      expectedSuggestionsDetails
    );

    // Return the suggestions in case we want to do more assertions
    return suggestions;
  }

  /** Return the attributes from a tag name suggestion insert text  */
  function getAttributes(textEdit: TextEdit | undefined): string[] {
    if (textEdit === undefined) {
      return [];
    }
    const result = /^[^ ]+ ([^>]+)/.exec(textEdit.newText);
    return result?.[1].split(" ") ?? [];
  }

  it("will get completion values for UI5 class", async () => {
    await assertClassesCompletions({
      xmlSnippet: `<GridLi⇶`,
      expected: [
        { label: "GridList", tagName: "f:GridList", replacedText: "GridLi" },
        {
          label: "GridListItem",
          tagName: "f:GridListItem",
          replacedText: "GridLi",
        },
      ],
      compareAttributes: false,
    });
  });

  it("will get completion values for UI5 class by fully qualified name", async () => {
    await assertClassesCompletions({
      xmlSnippet: `<sap.m.Busy⇶`,
      expected: [
        {
          label: "BusyDialog",
          tagName: "m:BusyDialog",
          attributes: [`xmlns:m="sap.m"`, TAB_STOP1],
          replacedText: "sap.m.Busy",
        },
        {
          label: "BusyIndicator",
          tagName: "m:BusyIndicator",
          attributes: [`xmlns:m="sap.m"`, TAB_STOP1],
          replacedText: "sap.m.Busy",
        },
      ],
    });
  });

  it("will insert class namespace with a new name when another namespace with the short name is defined", async () => {
    await assertClassesCompletions({
      xmlSnippet: `<sap.m.BusyI⇶ xmlns:m="sap.ui.core.mvc"`,
      expected: [
        {
          label: "BusyIndicator",
          tagName: "m2:BusyIndicator",
          attributes: [`xmlns:m2="sap.m"`],
          replacedText: "sap.m.BusyI",
        },
      ],
    });
  });

  it("will get completion values for UI5 class when the cursor is in the middle of a name", async () => {
    await assertClassesCompletions({
      xmlSnippet: `<Busy⇶Dialo`,
      expected: [
        {
          label: "BusyDialog",
          tagName: "m:BusyDialog",
          attributes: [`xmlns:m="sap.m"`, TAB_STOP1],
          replacedText: "BusyDialo",
        },
        {
          label: "BusyIndicator",
          tagName: "m:BusyIndicator",
          attributes: [`xmlns:m="sap.m"`, TAB_STOP1],
          replacedText: "BusyDialo",
        },
        {
          label: "LocalBusyIndicator",
          tagName: "core:LocalBusyIndicator",
          attributes: [`xmlns:core="sap.ui.core"`, TAB_STOP1],
          replacedText: "BusyDialo",
        },
        {
          label: "InboxBusyIndicator",
          tagName: "composite:InboxBusyIndicator",
          attributes: [
            `xmlns:composite="sap.uiext.inbox.composite"`,
            TAB_STOP1,
          ],
          replacedText: "BusyDialo",
        },
      ],
    });
  });

  it("will get completion values for UI5 class FQN when the cursor is in the middle of a name", async () => {
    await assertClassesCompletions({
      xmlSnippet: `<sap.m.Busy⇶Dialo`,
      expected: [
        {
          label: "BusyDialog",
          tagName: "m:BusyDialog",
          attributes: [`xmlns:m="sap.m"`, TAB_STOP1],
          replacedText: "sap.m.BusyDialo",
        },
        {
          label: "BusyIndicator",
          tagName: "m:BusyIndicator",
          attributes: [`xmlns:m="sap.m"`, TAB_STOP1],
          replacedText: "sap.m.BusyDialo",
        },
      ],
    });
  });

  it("will get completion values for UI5 class with namespace when the cursor is in the middle of a name", async () => {
    await assertClassesCompletions({
      xmlSnippet: `<m:Busy⇶Dialo xmlns:m="sap.m"`,
      expected: [
        {
          label: "BusyDialog",
          tagName: "m:BusyDialog",
          attributes: [],
          replacedText: "m:BusyDialo",
        },
        {
          label: "BusyIndicator",
          tagName: "m:BusyIndicator",
          attributes: [],
          replacedText: "m:BusyDialo",
        },
      ],
    });
  });

  it("will get completion values for UI5 class from all namespaces when default namespace exists", async () => {
    await assertClassesCompletions({
      xmlSnippet: `<RadioButtonGrou⇶ xmlns="sap.m" xmlns:commons="sap.ui.commons"`,
      expected: [
        {
          label: "RadioButtonGroup",
          tagName: "RadioButtonGroup",
          replacedText: "RadioButtonGrou",
        },
        {
          label: "RadioButtonGroup",
          tagName: "commons:RadioButtonGroup",
          replacedText: "RadioButtonGrou",
        },
      ],
      compareAttributes: false,
    });
  });

  it("will get completion values for UI5 class from a specific namespace", async () => {
    await assertClassesCompletions({
      xmlSnippet: `<f:Ca⇶ xmlns:f="sap.f"`,
      expected: [
        {
          label: "Card",
          tagName: "f:Card",
          attributes: [],
          replacedText: "f:Ca",
        },
      ],
    });
  });

  it("will get completion values for UI5 class from a specific namespace when name is not the parent name", async () => {
    await assertClassesCompletions({
      xmlSnippet: `<g:Ca⇶ xmlns:g="sap.f"`,
      expected: [
        {
          label: "Card",
          tagName: "g:Card",
          attributes: [],
          replacedText: "g:Ca",
        },
      ],
    });
  });

  it("will not insert the namespace when selecting completion for class in inner tag and namespace is already defined", async () => {
    await assertClassesCompletions({
      xmlSnippet: `<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">
        <content>
          <sap.m.MenuButto⇶n
        </content>
      </m:View>`,
      expected: [
        {
          label: "MenuButton",
          tagName: "m:MenuButton",
          attributes: [TAB_STOP1], // Check the namespace is not added on the same tag
          additionalTextEdits: [],
          replacedText: "sap.m.MenuButton",
        },
      ],
    });
  });

  it("will insert the namespace when selecting completion for class in inner tag and namespace is not defined", async () => {
    await assertClassesCompletions({
      xmlSnippet: `<m:View⭲⭰ xmlns:m="sap.ui.core.mvc">
        <content>
          <MenuButton⇶
        </content>
      </m:View>`,
      expected: [
        {
          label: "MenuButton",
          tagName: "m2:MenuButton",
          attributes: [TAB_STOP1], // Check the namespace is not added on the same tag
          additionalTextEdits: [
            {
              rangeIndex: 0,
              newText: ` xmlns:m2="sap.m"`,
            },
          ],
          replacedText: "MenuButton",
        },
        {
          label: "MenuButton",
          tagName: "commons:MenuButton",
          attributes: [TAB_STOP1], // Check the namespace is not added on the same tag
          additionalTextEdits: [
            {
              rangeIndex: 0,
              newText: ` xmlns:commons="sap.ui.commons"`,
            },
          ],
          replacedText: "MenuButton",
        },
      ],
    });
  });

  it("will not get completion values for unknown class", async () => {
    await assertClassesCompletions({
      xmlSnippet: `<Unknown⇶`,
      expected: [],
    });
  });

  it("will return valid class suggestions for empty tag with no closing bracket", async () => {
    const xmlSnippet = `<⇶`;
    const suggestions = await getSuggestions(xmlSnippet, ui5SemanticModel);
    expect(suggestions).to.not.be.empty;
    forEach(suggestions, (suggestion) => {
      // We're not replacing any text, just adding
      expect(getTextInRange(xmlSnippet, suggestion.textEdit?.range)).to.equal(
        ""
      );
      // Check the namespace is added at the correct position
      expect(suggestion.additionalTextEdits, "additionalTextEdits").to.be.empty;
      const tagName = getTagName(suggestion.textEdit);
      expectExists(tagName, "tag name in suggestion");
      const ns = tagName.split(":")[0];
      const attributes = getAttributes(suggestion.textEdit);
      expect(
        attributes,
        `attributes of ${suggestion.textEdit?.newText}`
      ).to.have.lengthOf(2); // Namespace and tab stop
      expect(
        attributes[0],
        `attributes[0] of ${suggestion.textEdit?.newText}`
      ).to.match(
        new RegExp(
          `^xmlns:${ns}=`
        ) /*, `attribute should start with xmlns:${ns}=`*/
      );
    });
  });

  it("will return valid class suggestions for empty tag with closing bracket", async () => {
    const xmlSnippet = `<⇶>`;
    const suggestions = await getSuggestions(xmlSnippet, ui5SemanticModel);
    expect(suggestions).to.not.be.empty;
    forEach(suggestions, (suggestion) => {
      // We're not replacing any text, just adding
      expect(getTextInRange(xmlSnippet, suggestion.textEdit?.range)).to.equal(
        ""
      );
      // Check the namespace is added at the correct position
      expect(suggestion.additionalTextEdits, "additionalTextEdits").to.be.empty;
      const tagName = getTagName(suggestion.textEdit);
      expectExists(tagName, "tag name in suggestion");
      const ns = tagName.split(":")[0];
      const attributes = getAttributes(suggestion.textEdit);
      expect(
        attributes,
        `attributes of ${suggestion.textEdit?.newText}`
      ).to.have.lengthOf(2); // Namespace and tab stop
      expect(
        attributes[0],
        `attributes[0] of ${suggestion.textEdit?.newText}`
      ).to.match(new RegExp(`^xmlns:${ns}=`));
    });
  });

  it("will get completion values for UI5 experimental class", async () => {
    const suggestions = await assertClassesCompletions({
      xmlSnippet: `<mvc:View 
          xmlns:mvc="sap.ui.core.mvc"
          xmlns:unified="sap.ui.unified">
        <content> <ContentS⇶`,
      expected: [
        {
          label: "ContentSwitcher",
          tagName: "unified:ContentSwitcher",
          replacedText: "ContentS",
        },
      ],
      compareAttributes: false,
    });
    forEach(suggestions, (suggestion) => {
      expect(suggestion.detail).to.contain("experimental");
    });
  });

  it("will replace the class closing tag name when the tag is closed and has the same name as the opening tag", async () => {
    await assertClassesCompletions({
      xmlSnippet: `<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns:commons="sap.ui.commons">
        <content>
          <MenuButton⇶></⭲MenuButton⭰>
        </content>
      </m:View>`,
      expected: [
        {
          label: "MenuButton",
          tagName: "m:MenuButton",
          additionalTextEdits: [
            {
              rangeIndex: 0,
              newText: `m:MenuButton`,
            },
          ],
          replacedText: "MenuButton",
        },
        {
          label: "MenuButton",
          tagName: "commons:MenuButton",
          additionalTextEdits: [
            {
              rangeIndex: 0,
              newText: `commons:MenuButton`,
            },
          ],
          replacedText: "MenuButton",
        },
      ],
    });
  });

  it("will not replace the class closing tag name when the tag is closed and has a different name from the opening tag", async () => {
    await assertClassesCompletions({
      xmlSnippet: `<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns:commons="sap.ui.commons">
        <content>
          <MenuButton⇶></MenuButton1>
        </content>
      </m:View>`,
      expected: [
        {
          label: "MenuButton",
          tagName: "m:MenuButton",
          additionalTextEdits: [],
          replacedText: "MenuButton",
        },
        {
          label: "MenuButton",
          tagName: "commons:MenuButton",
          additionalTextEdits: [],
          replacedText: "MenuButton",
        },
      ],
    });
  });

  it("will not replace the class closing tag name when the tag is closed and the opening tag doesn't have a name", async () => {
    await assertClassesCompletions({
      xmlSnippet: `<mvc:View xmlns:core="sap.ui.core" xmlns:mvc="sap.ui.core.mvc">
          <customData>
              <⇶></MenuButton1>
          </customData>
      </mvc:View>`,
      expected: [
        {
          label: "CustomData",
          tagName: "core:CustomData",
          additionalTextEdits: [],
          replacedText: "",
        },
      ],
    });
  });

  it("will replace the class closing tag name when the tag is closed and does not have a name", async () => {
    await assertClassesCompletions({
      xmlSnippet: `<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns:commons="sap.ui.commons">
          <content>
            <MenuButton⇶>⭲</>⭰
          </content>
        </m:View>`,
      expected: [
        {
          label: "MenuButton",
          tagName: "m:MenuButton",
          additionalTextEdits: [
            {
              rangeIndex: 0,
              newText: `</m:MenuButton>`,
            },
          ],
          replacedText: "MenuButton",
        },
        {
          label: "MenuButton",
          tagName: "commons:MenuButton",
          additionalTextEdits: [
            {
              rangeIndex: 0,
              newText: `</commons:MenuButton>`,
            },
          ],
          replacedText: "MenuButton",
        },
      ],
    });
  });

  it("will replace the class closing tag name when also inserting the namespace", async () => {
    await assertClassesCompletions({
      xmlSnippet: `<mvc:View⭲⭰ xmlns:mvc="sap.ui.core.mvc">
          <content>
            <MenuButton⇶></⭲MenuButton⭰>
          </content>
        </m:View>`,
      expected: [
        {
          label: "MenuButton",
          tagName: "m:MenuButton",
          additionalTextEdits: [
            {
              rangeIndex: 0,
              newText: ` xmlns:m="sap.m"`,
            },
            {
              rangeIndex: 1,
              newText: `m:MenuButton`,
            },
          ],
          replacedText: "MenuButton",
        },
        {
          label: "MenuButton",
          tagName: "commons:MenuButton",
          additionalTextEdits: [
            {
              rangeIndex: 0,
              newText: ` xmlns:commons="sap.ui.commons"`,
            },
            {
              rangeIndex: 1,
              newText: `commons:MenuButton`,
            },
          ],
          replacedText: "MenuButton",
        },
      ],
    });
  });
});
