import { expect } from "chai";
import { metaPathSuggestions } from "../../../src/providers/attributeValue/meta-path";
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
    attributeValue: [metaPathSuggestions],
  };
  before(function () {
    const timeout = 5 * 60000 + 8000; // 5 min for initial npm install + 8 sec
    this.timeout(timeout);
    suggestionsScenario = getSuggestionsScenario();
  });
  context("metaPath", () => {
    const pathSegments = ["app", "manage_travels", "annotations.cds"];
    context("without contextPath attribute", () => {
      it("direct annotation term", async () => {
        // annotate Travel entity set
        const cdsSnippet = `
        using TravelService as service from '../../srv/travel-service';
        annotate service.Travel with @UI.Chart  #chartOnTravel: {
            $Type : 'UI.ChartDefinitionType',
            ChartType : #Bar,
        };
        `;
        await suggestionsScenario.testUtils.updateFile(
          pathSegments,
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
                <macros:Chart metaPath="⇶"></macros:Chart>
              </items>
            </HBox>
          </content>
        </Page>
        </mvc:View>
        `;
        const suggestions = await suggestionsScenario.run(content, providers);
        expect(suggestions[0]?.ui5Node).to.deep.equal({
          kind: "AnnotationPath",
          name: "@com.sap.vocabularies.UI.v1.Chart#chartOnTravel",
          value: "@com.sap.vocabularies.UI.v1.Chart#chartOnTravel",
        });
      });
      it("annotation term via navigation", async () => {
        // annotate Booking entity set
        const cdsSnippet = `
        using TravelService as service from '../../srv/travel-service';
        annotate service.Booking with @(
            UI.DataPoint #BookedFlights : {
                Value : BookedFlights,
                TargetValue : to_Carrier.VIPCustomerBookings,
                Criticality : EligibleForPrime
            },
            UI.Chart #BookedFlights : {
                ChartType : #Donut,
                Measures : [
                    BookedFlights,
                ],
                MeasureAttributes : [
                    {
                        DataPoint : '@UI.DataPoint#BookedFlights',
                        Role : #Axis1,
                        Measure : BookedFlights,
                    },
                ],
            }
        );`;
        await suggestionsScenario.testUtils.updateFile(
          pathSegments,
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
                <macros:Chart metaPath="⇶"></macros:Chart>
              </items>
            </HBox>
          </content>
        </Page>
        </mvc:View>
        `;
        const suggestions = await suggestionsScenario.run(content, providers);
        expect(suggestions[0]?.ui5Node).to.deep.equal({
          kind: "AnnotationPath",
          name: "to_Booking/@com.sap.vocabularies.UI.v1.Chart#BookedFlights",
          value: "to_Booking/@com.sap.vocabularies.UI.v1.Chart#BookedFlights",
        });
      });
      it("target property", async () => {
        // empty file for consistency
        const cdsSnippet = `using TravelService as service from '../../srv/travel-service';`;
        await suggestionsScenario.testUtils.updateFile(
          pathSegments,
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
                <macros:Field metaPath="⇶"></macros:Field>
              </items>
            </HBox>
          </content>
        </Page>
        </mvc:View>
        `;
        const suggestions = await suggestionsScenario.run(content, providers);
        expect(suggestions.length).to.equal(95);
        // direct target property
        const oneSuggestionItem = suggestions.find(
          (item) => item.ui5Node.name === "acceptEnabled"
        );
        expect(oneSuggestionItem?.ui5Node).to.deep.equal({
          kind: "AnnotationPath",
          name: "acceptEnabled",
          value: "acceptEnabled",
        });

        // target property via navigation
        const oneSuggestionItemViaNav = suggestions.find(
          (item) => item.ui5Node.name === "to_Agency/Name"
        );
        expect(oneSuggestionItemViaNav?.ui5Node).to.deep.equal({
          kind: "AnnotationPath",
          name: "to_Agency/Name",
          value: "to_Agency/Name",
        });
        // target property via navigation with 3 max. segments
        const oneSuggestionItemViaMax3Nav = suggestions.find(
          (item) => item.ui5Node.name === "to_Agency/CountryCode/name"
        );
        expect(oneSuggestionItemViaMax3Nav?.ui5Node).to.deep.equal({
          kind: "AnnotationPath",
          name: "to_Agency/CountryCode/name",
          value: "to_Agency/CountryCode/name",
        });
      });
    });
    context("with contextPath attribute", () => {
      it("direct annotation term", async () => {
        // annotate Airline entity
        const cdsSnippet = `
        using TravelService as service from '../../srv/travel-service';
        annotate service.Airline with @(
            UI.Chart #airline : {
                ChartType : #Donut,
            }
        );
        `;
        await suggestionsScenario.testUtils.updateFile(
          pathSegments,
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
                <macros:Chart metaPath="⇶" contextPath="/Airline"></macros:Chart>
              </items>
            </HBox>
          </content>
        </Page>
        </mvc:View>`;
        const suggestions = await suggestionsScenario.run(content, providers);
        expect(suggestions?.length).to.equal(1);
        expect(suggestions[0]?.ui5Node).to.deep.equal({
          kind: "AnnotationPath",
          name: "@com.sap.vocabularies.UI.v1.Chart#airline",
          value: "@com.sap.vocabularies.UI.v1.Chart#airline",
        });
      });
      it("target property", async () => {
        // empty file for consistency
        const cdsSnippet = `using TravelService as service from '../../srv/travel-service';`;
        await suggestionsScenario.testUtils.updateFile(
          pathSegments,
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
                <macros:Field metaPath="⇶" contextPath="/Airline"></macros:Field>
              </items>
            </HBox>
          </content>
        </Page>
        </mvc:View>`;
        const suggestions = await suggestionsScenario.run(content, providers);
        expect(suggestions?.length).to.equal(5);
        // direct target property
        const oneSuggestionItem = suggestions.find(
          (item) => item.ui5Node.name === "Name"
        );
        expect(oneSuggestionItem?.ui5Node).to.deep.equal({
          kind: "AnnotationPath",
          name: "Name",
          value: "Name",
        });

        // no target property via navigation
        const oneSuggestionItemViaNav = suggestions.find(
          (item) => item.ui5Node.name === "to_Agency/Name"
        );
        expect(oneSuggestionItemViaNav).to.be.equal(undefined);
      });
    });
  });
});
