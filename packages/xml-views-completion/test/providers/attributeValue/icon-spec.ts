// import { expect } from "chai";
// import { forEach, map } from "lodash";
// import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
// import { generateModel } from "@ui5-language-assistant/test-utils";
// import { generate } from "@ui5-language-assistant/semantic-model";
// import { XMLAttribute, XMLElement } from "@xml-tools/ast";
// import { iconSuggestions } from "../../../src/providers/attributeValue/icon";
// import { UI5XMLViewCompletion } from "../../../api";
// import { testSuggestionsScenario } from "../../utils";

// describe("The ui5-language-assistant xml-views-completion", () => {
//   let ui5SemanticModel: UI5SemanticModel;
//   before(async function () {
//     ui5SemanticModel = await generateModel({
//       framework: "SAPUI5",
//       version: "1.71.49",
//       modelGenerator: generate,
//     });
//   });

//   context("icon values", () => {
//     context("applicable scenarios", () => {
//       it("will suggest icon values with no prefix provided", () => {
//         const xmlSnippet = `
//           <mvc:View
//             xmlns:mvc="sap.ui.core.mvc"
//             xmlns="sap.m">
//             <Button icon = "⇶">
//             </Button>
//           </mvc:View>`;

//         testSuggestionsScenario({
//           model: ui5SemanticModel,
//           xmlText: xmlSnippet,
//           providers: {
//             attributeValue: [iconSuggestions],
//           },
//           assertion: (suggestions) => {
//             const suggestedValues = map(suggestions, (_) => _.ui5Node.name);
//             expect(suggestedValues).to.deep.equalInAnyOrder([
//               "All",
//               "Inner",
//               "None",
//             ]);
//             expectIconValuesSuggestions(suggestions, "List");
//           },
//         });
//       });

//       it("will suggest icon values filtered by prefix", () => {
//         const xmlSnippet = `
//           <mvc:View
//             xmlns:mvc="sap.ui.core.mvc"
//             xmlns="sap.m">
//             <Button icon = "⇶">
//             </Button>
//           </mvc:View>`;

//         testSuggestionsScenario({
//           model: ui5SemanticModel,
//           xmlText: xmlSnippet,
//           providers: {
//             attributeValue: [iconSuggestions],
//           },
//           assertion: (suggestions) => {
//             const suggestedValues = map(suggestions, (_) => _.ui5Node.name);
//             expect(suggestedValues).to.deep.equalInAnyOrder(["Inner", "None"]);
//             expectIconValuesSuggestions(suggestions, "List");
//           },
//         });
//       });

//       it("Will not suggest any icon values if none match the prefix", () => {
//         const xmlSnippet = `
//           <mvc:View
//             xmlns:mvc="sap.ui.core.mvc"
//             xmlns="sap.m">
//             <Button icon = "⇶">
//             </Button>
//           </mvc:View>`;

//         testSuggestionsScenario({
//           model: ui5SemanticModel,
//           xmlText: xmlSnippet,
//           providers: {
//             attributeValue: [iconSuggestions],
//           },
//           assertion: (suggestions) => {
//             expect(suggestions).to.be.empty;
//           },
//         });
//       });
//     });

//     context("none applicable scenarios", () => {
//       it("will not provide any suggestions when the property is not of icon type", () => {
//         const xmlSnippet = `
//           <mvc:View
//             xmlns:mvc="sap.ui.core.mvc"
//             xmlns="sap.m">
//             <List icon = "⇶">
//             </List>
//           </mvc:View>`;

//         testSuggestionsScenario({
//           model: ui5SemanticModel,
//           xmlText: xmlSnippet,
//           providers: {
//             attributeValue: [iconSuggestions],
//           },
//           assertion: (suggestions) => {
//             expect(suggestions).to.be.empty;
//           },
//         });
//       });

//       it("will not provide any suggestions when it is not an attribute value completion", () => {
//         const xmlSnippet = `
//           <mvc:View
//             xmlns:mvc="sap.ui.core.mvc"
//             xmlns="sap.m">
//             <Button ⇶>
//             </Button>
//           </mvc:View>`;

//         testSuggestionsScenario({
//           model: ui5SemanticModel,
//           xmlText: xmlSnippet,
//           providers: {
//             attributeValue: [iconSuggestions],
//           },
//           assertion: (suggestions) => {
//             expect(suggestions).to.be.empty;
//           },
//         });
//       });

//       it("will not provide any suggestions when the property type is undefined", () => {
//         const xmlSnippet = `
//           <mvc:View
//             xmlns:mvc="sap.ui.core.mvc"
//             xmlns="sap.m">
//             <App homeIcon = "⇶">
//             </App>
//           </mvc:View>`;

//         testSuggestionsScenario({
//           model: ui5SemanticModel,
//           xmlText: xmlSnippet,
//           providers: {
//             attributeValue: [iconSuggestions],
//           },
//           assertion: (suggestions) => {
//             expect(suggestions).to.be.empty;
//           },
//         });
//       });

//       it("will not provide any suggestions when not inside a UI5 Class", () => {
//         const xmlSnippet = `
//           <mvc:View
//             xmlns:mvc="sap.ui.core.mvc"
//             xmlns="sap.m">
//             <Bamba icon = "⇶">
//             </Bamba>
//           </mvc:View>`;

//         testSuggestionsScenario({
//           model: ui5SemanticModel,
//           xmlText: xmlSnippet,
//           providers: {
//             attributeValue: [iconSuggestions],
//           },
//           assertion: (suggestions) => {
//             expect(ui5SemanticModel.classes["sap.ui.core.mvc.Bamba"]).to.be
//               .undefined;
//             expect(suggestions).to.be.empty;
//           },
//         });
//       });

//       it("Will not suggest any enum values if there is no matching UI5 property", () => {
//         const xmlSnippet = `
//           <mvc:View
//             xmlns:mvc="sap.ui.core.mvc"
//             xmlns="sap.m">
//             <Button UNKNOWN = "⇶">
//             </Button>
//           </mvc:View>`;

//         testSuggestionsScenario({
//           model: ui5SemanticModel,
//           xmlText: xmlSnippet,
//           providers: {
//             attributeValue: [iconSuggestions],
//           },
//           assertion: (suggestions) => {
//             expect(suggestions).to.be.empty;
//           },
//         });
//       });
//     });
//   });
// });

// function expectIconValuesSuggestions(
//   suggestions: UI5XMLViewCompletion[],
//   expectedParentTag: string
// ): void {
//   forEach(suggestions, (_) => {
//     expect(_.type).to.equal(`UI5IconInXMLAttributeValue`);
//     expect((_.astNode as XMLAttribute).key).to.equal("showSeparators");
//     expect((_.astNode.parent as XMLElement).name).to.equal(expectedParentTag);
//   });
// }
