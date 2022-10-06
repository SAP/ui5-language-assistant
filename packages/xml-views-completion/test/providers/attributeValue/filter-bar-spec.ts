import { expect } from "chai";
import { filterBarAttributeSuggestions } from "../../../src/providers/attributeValue/filter-bar";
import { getSuggestionsScenario } from "../../utils";
import { UI5XMLViewCompletion } from "../../../api";
import { SuggestionProviders } from "@xml-tools/content-assist";
import { AppContext } from "@ui5-language-assistant/semantic-model-types";
import type { TestUtils } from "@ui5-language-assistant/test-utils";

describe("The ui5-language-assistant xml-views-completion", () => {
  let suggestionsScenario: {
    testUtils: TestUtils;
    run: (
      content: string,
      providers: SuggestionProviders<UI5XMLViewCompletion, AppContext>,
      pathSegments?: string[]
    ) => Promise<UI5XMLViewCompletion[]>;
  };
  const providers = {
    attributeValue: [filterBarAttributeSuggestions],
  };
  before(function () {
    const timeout = 5 * 60000 + 8000; // 5 min for initial npm install + 8 sec
    this.timeout(timeout);
    suggestionsScenario = getSuggestionsScenario();
  });
  it("filterBar", async () => {
    const content = `
      <mvc:View xmlns:core="sap.ui.core"
        xmlns:mvc="sap.ui.core.mvc"
        xmlns="sap.m"
        xmlns:macros="sap.fe.macros">
      <Page>
        <content>
          <HBox >
            <items>
              <macros:FilterBar id="testFilterBarId01"></macros:FilterBar>
              <macros:Chart filterBar="⇶"></macros:Chart>
            </items>
          </HBox>
        </content>
      </Page>
      </mvc:View>`;
    const suggestions = await suggestionsScenario.run(content, providers);
    expect(suggestions.length).to.equal(1);
    expect(suggestions[0]?.ui5Node).to.deep.equal({
      kind: "AnnotationPath",
      name: "testFilterBarId01",
      value: "testFilterBarId01",
    });
  });
});
