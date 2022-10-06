import { expect } from "chai";
import { contextPathSuggestions } from "../../../src/providers/attributeValue/context-path";
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
    attributeValue: [contextPathSuggestions],
  };
  before(function () {
    const timeout = 5 * 60000 + 8000; // 5 min for initial npm install + 8 sec
    this.timeout(timeout);
    suggestionsScenario = getSuggestionsScenario();
  });
  context("contextPath", () => {
    const annoPathSegments = ["app", "manage_travels", "annotations.cds"];
    it("target", async () => {
      // annotate Travel entity
      const cdsSnippet = `
        using TravelService as service from '../../srv/travel-service';
        annotate service.Travel with @UI.Chart  #chartOnTravel: {
            $Type : 'UI.ChartDefinitionType',
            ChartType : #Bar,
        };`;
      await suggestionsScenario.testUtils.updateFile(
        annoPathSegments,
        cdsSnippet
      );
      // empty cache to consider new cds data
      suggestionsScenario.testUtils.emptyCache();
      const content = `
        <mvc:View xmlns:core="sap.ui.core"
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.m"
          xmlns:macros="sap.fe.macros">
        <Page>
          <content>
            <HBox >
              <items>
                <macros:Chart contextPath="⇶"></macros:Chart>
              </items>
            </HBox>
          </content>
        </Page>
        </mvc:View>`;
      const suggestions = await suggestionsScenario.run(content, providers);
      expect(suggestions.length).to.equal(5);
      // direct target
      const oneSuggestionItem = suggestions.find(
        (item) => item.ui5Node.name === "/Travel"
      );
      expect(oneSuggestionItem?.ui5Node).to.deep.equal({
        kind: "AnnotationTarget",
        name: "/Travel",
        value: "/Travel",
      });
      // nav target
      const oneSuggestionItemViaNav = suggestions.find(
        (item) => item.ui5Node.name === "/Booking/to_Travel"
      );
      expect(oneSuggestionItemViaNav?.ui5Node).to.deep.equal({
        kind: "AnnotationTarget",
        name: "/Booking/to_Travel",
        value: "/Booking/to_Travel",
      });
      // nav target with max 3 segments
      const oneSuggestionItemViaMax3Nav = suggestions.find(
        (item) =>
          item.ui5Node.name === "/BookingSupplement/to_Booking/to_Travel"
      );
      expect(oneSuggestionItemViaMax3Nav?.ui5Node).to.deep.equal({
        kind: "AnnotationTarget",
        name: "/BookingSupplement/to_Booking/to_Travel",
        value: "/BookingSupplement/to_Booking/to_Travel",
      });
    });
    it("property", async () => {
      // empty file for consistency
      const cdsSnippet = `using TravelService as service from '../../srv/travel-service';`;
      await suggestionsScenario.testUtils.updateFile(
        annoPathSegments,
        cdsSnippet
      );
      // empty cache to consider new cds data
      suggestionsScenario.testUtils.emptyCache();
      const content = `
        <mvc:View xmlns:core="sap.ui.core"
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.m"
          xmlns:macros="sap.fe.macros">
        <Page>
          <content>
            <HBox >
              <items>
                <macros:Field contextPath="⇶"></macros:Field>
              </items>
            </HBox>
          </content>
        </Page>
        </mvc:View>`;
      const suggestions = await suggestionsScenario.run(content, providers);
      expect(suggestions.length).to.equal(137);
      // direct target where there is a property
      const oneSuggestionItem = suggestions.find(
        (item) => item.ui5Node.name === "/Airline"
      );
      expect(oneSuggestionItem?.ui5Node).to.deep.equal({
        kind: "AnnotationTarget",
        name: "/Airline",
        value: "/Airline",
      });
      // target via nav where there is a property
      const oneSuggestionItemViaNav = suggestions.find(
        (item) => item.ui5Node.name === "/BookedFlights/to_Travel"
      );
      expect(oneSuggestionItemViaNav?.ui5Node).to.deep.equal({
        kind: "AnnotationTarget",
        name: "/BookedFlights/to_Travel",
        value: "/BookedFlights/to_Travel",
      });
      // nav target with max 3 segments where there is a property
      const oneSuggestionItemViaMax3Nav = suggestions.find(
        (item) => item.ui5Node.name === "/BookedFlights/to_Travel/to_Customer"
      );
      expect(oneSuggestionItemViaMax3Nav?.ui5Node).to.deep.equal({
        kind: "AnnotationTarget",
        name: "/BookedFlights/to_Travel/to_Customer",
        value: "/BookedFlights/to_Travel/to_Customer",
      });
    });
  });
});
