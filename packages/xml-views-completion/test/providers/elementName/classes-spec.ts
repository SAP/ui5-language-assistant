import { expect } from "chai";
import { clone, cloneDeep, find, forEach, map } from "lodash";
import { XMLElement } from "@xml-tools/ast";
import {
  AppContext,
  UI5Aggregation,
  UI5Class,
  UI5SemanticModel,
} from "@ui5-language-assistant/semantic-model-types";
import { generateModel } from "@ui5-language-assistant/test-utils";
import { generate } from "@ui5-language-assistant/semantic-model";
import {
  getSuperClasses,
  ui5NodeToFQN,
} from "@ui5-language-assistant/logic-utils";
import { classesSuggestions } from "../../../src/providers/elementName/classes";
import {
  UI5XMLViewCompletion,
  UI5ClassesInXMLTagNameCompletion,
} from "../../../api";
import { testSuggestionsScenario } from "../../utils";

describe("The ui5-language-assistant xml-views-completion", () => {
  let ui5Model: UI5SemanticModel;
  let appContext: AppContext;
  before(async function () {
    ui5Model = await generateModel({
      framework: "SAPUI5",
      version: "1.71.49",
      modelGenerator: generate,
    });
    appContext = {
      services: {},
      ui5Model,
    };
  });

  context("UI5 Classes Suggestions", () => {
    context("applicable scenarios", () => {
      context("classes at the document's root", () => {
        context("no prefix", () => {
          it("will suggest **all** Controls at the top level", () => {
            const xmlSnippet = `
              <⇶
            `;

            testSuggestionsScenario({
              context: appContext,
              xmlText: xmlSnippet,
              providers: {
                elementName: [classesSuggestions],
              },
              assertion: (suggestions) => {
                const baseControl = ui5Model.classes["sap.ui.core.Control"];
                expect(suggestions).to.have.length.greaterThan(200);
                forEach(suggestions, (_) => {
                  expect(_.ui5Node.kind).to.equal("UI5Class");
                  const superClasses = getSuperClasses(_.ui5Node as UI5Class);
                  // Chai's `.include` is super slow, we must implement it ourselves...
                  const doesSuggestionExtendsControl =
                    find(superClasses, baseControl) !== undefined;
                  expect(
                    doesSuggestionExtendsControl || _.ui5Node === baseControl
                  ).to.be.true;
                });
              },
            });
          });
        });

        context("prefix without xmlns", () => {
          it("will suggest **only** classes matching `sap.ui.core.Control` (not Element) type and the **prefix**", () => {
            const xmlSnippet = `
              <QuickView⇶
            `;

            testSuggestionsScenario({
              context: appContext,
              xmlText: xmlSnippet,
              providers: {
                elementName: [classesSuggestions],
              },
              assertion: (suggestions) => {
                assertSuggestionProperties(suggestions, undefined);
                const suggestionNames = map(suggestions, (_) =>
                  ui5NodeToFQN(_.ui5Node)
                );
                expect(suggestionNames).to.deep.equalInAnyOrder([
                  "sap.m.QuickView",
                  "sap.m.QuickViewBase",
                  "sap.m.QuickViewCard",
                  "sap.m.QuickViewPage",
                  "sap.ui.ux3.QuickView",
                ]);

                const quickViewGroup = ui5Model.classes["sap.m.QuickViewGroup"];
                expect(quickViewGroup).to.exist;
                expect(quickViewGroup.extends).to.equal(
                  ui5Model.classes["sap.ui.core.Element"]
                );
                expect(suggestionNames).to.not.include([
                  "sap.m.QuickViewGroup",
                ]);
              },
            });
          });
        });
      });

      context("classes under (implicit) default aggregations", () => {
        context("no prefix", () => {
          it("will suggest **all** classes matching the type of the default aggregation", () => {
            const xmlSnippet = `
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m">
              <ActionSheet>
                <⇶
              </ActionSheet>
            </mvc:View>`;

            testSuggestionsScenario({
              context: appContext,
              xmlText: xmlSnippet,
              providers: {
                elementName: [classesSuggestions],
              },
              assertion: (suggestions) => {
                assertSuggestionProperties(suggestions, "ActionSheet");
                const suggestionNames = map(suggestions, (_) =>
                  ui5NodeToFQN(_.ui5Node)
                );
                // Can "manually" traverse expected graph of `sap.m.Button` subClasses here:
                //   - https://ui5.sap.com/1.71.49/#/api/sap.m.Button
                expect(suggestionNames).to.deep.equalInAnyOrder([
                  "sap.m.Button",
                  "sap.m.OverflowToolbarButton",
                  "sap.m.OverflowToolbarToggleButton",
                  "sap.m.ToggleButton",
                  "sap.uxap.ObjectPageHeaderActionButton",
                  "sap.suite.ui.commons.ProcessFlowConnectionLabel",
                  "sap.ushell.ui.footerbar.AddBookmarkButton",
                ]);
              },
            });
          });
        });

        context("prefix without xmlns", () => {
          it("will suggest **only** classes matching **both** the type of the default aggregation and the **prefix**", () => {
            const xmlSnippet = `
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m">
              <ActionSheet>
                <Overflow⇶
              </ActionSheet>
            </mvc:View>`;

            testSuggestionsScenario({
              context: appContext,
              xmlText: xmlSnippet,
              providers: {
                elementName: [classesSuggestions],
              },
              assertion: (suggestions) => {
                assertSuggestionProperties(suggestions, "ActionSheet");
                const suggestionNames = map(suggestions, (_) =>
                  ui5NodeToFQN(_.ui5Node)
                );
                // Can "manually" traverse expected graph of `sap.m.Button` subClasses here:
                //   - https://ui5.sap.com/1.71.49/#/api/sap.m.Button
                expect(suggestionNames).to.deep.equalInAnyOrder([
                  "sap.m.OverflowToolbarButton",
                  "sap.m.OverflowToolbarToggleButton",
                ]);
              },
            });
          });
        });

        context("prefix with xmlns", () => {
          it("will suggest **only** classes matching **both** the type of the default aggregation and the **xmlns prefix**", () => {
            const xmlSnippet = `
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns:bamba="sap.m">
              <bamba:ActionSheet>
                <bamba:Overflow⇶
              </bamba:ActionSheet>
            </mvc:View>`;

            testSuggestionsScenario({
              context: appContext,
              xmlText: xmlSnippet,
              providers: {
                elementName: [classesSuggestions],
              },
              assertion: (suggestions) => {
                assertSuggestionProperties(suggestions, "ActionSheet");
                const suggestionNames = map(suggestions, (_) =>
                  ui5NodeToFQN(_.ui5Node)
                );
                // Can "manually" traverse expected graph of `sap.m.Button` subClasses here:
                //   - https://ui5.sap.com/1.71.49/#/api/sap.m.Button
                expect(suggestionNames).to.deep.equalInAnyOrder([
                  "sap.m.OverflowToolbarButton",
                  "sap.m.OverflowToolbarToggleButton",
                ]);
              },
            });
          });
        });
      });

      context("classes under an explicit aggregation", () => {
        context("no prefix", () => {
          it("will suggest **all** classes matching the type of the **explicit aggregation**", () => {
            const xmlSnippet = `
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m">
              <mvc:layoutData>
                <⇶
              </mvc:layoutData>
            </mvc:View>`;

            testSuggestionsScenario({
              context: appContext,
              xmlText: xmlSnippet,
              providers: {
                elementName: [classesSuggestions],
              },
              assertion: (suggestions) => {
                assertSuggestionProperties(suggestions, "layoutData");
                const suggestionNames = map(suggestions, (_) =>
                  ui5NodeToFQN(_.ui5Node)
                );
                // Can "manually" traverse expected graph of `sap.ui.core.LayoutData` subClasses here:
                //   - https://ui5.sap.com/1.71.49/#/api/sap.ui.core.LayoutData
                expect(suggestionNames).to.deep.equalInAnyOrder([
                  "sap.ui.core.VariantLayoutData",
                  "sap.f.GridContainerItemLayoutData",
                  "sap.m.FlexItemData",
                  "sap.m.ToolbarLayoutData",
                  "sap.m.OverflowToolbarLayoutData",
                  "sap.ui.layout.BlockLayoutCellData",
                  "sap.ui.layout.cssgrid.GridItemLayoutData",
                  "sap.ui.layout.form.ColumnContainerData",
                  "sap.ui.layout.form.ColumnElementData",
                  "sap.ui.layout.form.GridContainerData",
                  "sap.ui.commons.form.GridContainerData",
                  "sap.ui.layout.form.GridElementData",
                  "sap.ui.commons.form.GridElementData",
                  "sap.ui.layout.GridData",
                  "sap.ui.layout.ResponsiveFlowLayoutData",
                  "sap.ui.commons.layout.ResponsiveFlowLayoutData",
                  "sap.ui.layout.SplitterLayoutData",
                  "sap.uxap.ObjectPageHeaderLayoutData",
                  "sap.ui.vk.FlexibleControlLayoutData",
                ]);
              },
            });
          });

          it("will suggest classes that implement the interface when the aggregation has an interface type", () => {
            const xmlSnippet = `
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m">
              <Page>
                <footer>
                  <⇶
                </footer>
                </Page>
            </mvc:View>`;

            testSuggestionsScenario({
              context: appContext,
              xmlText: xmlSnippet,
              providers: {
                elementName: [classesSuggestions],
              },
              assertion: (suggestions) => {
                assertSuggestionProperties(suggestions, "footer");
                const suggestionNames = map(suggestions, (_) =>
                  ui5NodeToFQN(_.ui5Node)
                );
                expect(suggestionNames).to.deep.equalInAnyOrder([
                  "sap.f.ShellBar",
                  "sap.m.Bar",
                  "sap.m.OverflowToolbar",
                  "sap.gantt.simple.ContainerToolbar",
                  "sap.tnt.ToolHeader",
                  "sap.uxap.AnchorBar",
                  "sap.m.Toolbar",
                ]);
              },
            });
          });
        });

        context("prefix without xmlns", () => {
          it("will suggest **all** classes matching the type of the **explicit aggregation**", () => {
            const xmlSnippet = `
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m">
              <mvc:layoutData>
                <GridContainer⇶
              </mvc:layoutData>
            </mvc:View>`;

            testSuggestionsScenario({
              context: appContext,
              xmlText: xmlSnippet,
              providers: {
                elementName: [classesSuggestions],
              },
              assertion: (suggestions) => {
                assertSuggestionProperties(suggestions, "layoutData");
                const suggestionNames = map(suggestions, (_) =>
                  ui5NodeToFQN(_.ui5Node)
                );
                // Can "manually" traverse expected graph of `sap.ui.core.LayoutData` subClasses here:
                //   - https://ui5.sap.com/1.71.49/#/api/sap.ui.core.LayoutData
                expect(suggestionNames).to.deep.equalInAnyOrder([
                  "sap.f.GridContainerItemLayoutData",
                  "sap.ui.layout.form.GridContainerData",
                  "sap.ui.commons.form.GridContainerData",
                ]);
              },
            });
          });
        });

        context("prefix with xmlns", () => {
          context("xmlns usage with text after the colon", () => {
            it("will suggest **only** classes matching **both** the type of the default aggregation and the **xmlns prefix**", () => {
              const xmlSnippet = `
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m"
              xmlns:forms="sap.ui.commons.form"
              >
              <mvc:layoutData>
                <forms:GridContainer⇶
              </mvc:layoutData>
            </mvc:View>`;

              testSuggestionsScenario({
                context: appContext,
                xmlText: xmlSnippet,
                providers: {
                  elementName: [classesSuggestions],
                },
                assertion: (suggestions) => {
                  assertSuggestionProperties(suggestions, "layoutData");
                  const suggestionNames = map(suggestions, (_) =>
                    ui5NodeToFQN(_.ui5Node)
                  );
                  // Can "manually" traverse expected graph of `sap.ui.core.LayoutData` subClasses here:
                  //   - https://ui5.sap.com/1.71.49/#/api/sap.ui.core.LayoutData
                  expect(suggestionNames).to.deep.equalInAnyOrder([
                    "sap.ui.commons.form.GridContainerData",
                  ]);
                },
              });
            });

            it("will only suggest classes from the specified namespace and not its sub-namespace", () => {
              const xmlSnippet = `
                <mvc:View
                  xmlns:mvc="sap.ui.core.mvc"
                  xmlns:core="sap.ui.core"
                  >
                  <mvc:content>
                    <core:Con⇶
                  </mvc:content>
                </mvc:View>`;

              testSuggestionsScenario({
                context: appContext,
                xmlText: xmlSnippet,
                providers: {
                  elementName: [classesSuggestions],
                },
                assertion: (suggestions) => {
                  assertSuggestionProperties(suggestions, "content");
                  const suggestionNames = map(suggestions, (_) =>
                    ui5NodeToFQN(_.ui5Node)
                  );
                  expect(suggestionNames).to.deep.equalInAnyOrder([
                    "sap.ui.core.ComponentContainer",
                  ]);
                  expect(suggestionNames).to.not.include(
                    "sap.ui.core.tmpl.TemplateControl"
                  );
                },
              });
            });
          });

          context(
            "xmlns usage with the prefix only (nothing after colon)",
            () => {
              it("will suggest **only** classes matching **both** the type of the default aggregation and the **xmlns prefix**", () => {
                const xmlSnippet = `
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m"
              xmlns:forms="sap.ui.commons.form"
              >
              <mvc:layoutData>
                <forms:⇶
              </mvc:layoutData>
            </mvc:View>`;

                testSuggestionsScenario({
                  context: appContext,
                  xmlText: xmlSnippet,
                  providers: {
                    elementName: [classesSuggestions],
                  },
                  assertion: (suggestions) => {
                    assertSuggestionProperties(suggestions, "layoutData");
                    const suggestionNames = map(suggestions, (_) =>
                      ui5NodeToFQN(_.ui5Node)
                    );
                    // Can "manually" traverse expected graph of `sap.ui.core.LayoutData` subClasses here:
                    //   - https://ui5.sap.com/1.71.49/#/api/sap.ui.core.LayoutData
                    expect(suggestionNames).to.deep.equalInAnyOrder([
                      "sap.ui.commons.form.GridContainerData",
                      "sap.ui.commons.form.GridElementData",
                    ]);
                  },
                });
              });

              it("will only suggest classes from the specified namespace and not its sub-namespaces", () => {
                const xmlSnippet = `
                  <mvc:View
                    xmlns:mvc="sap.ui.core.mvc"
                    xmlns:core="sap.ui.core"
                    >
                    <mvc:content>
                      <core:⇶
                    </mvc:content>
                  </mvc:View>`;

                testSuggestionsScenario({
                  context: appContext,
                  xmlText: xmlSnippet,
                  providers: {
                    elementName: [classesSuggestions],
                  },
                  assertion: (suggestions) => {
                    assertSuggestionProperties(suggestions, "content");
                    const suggestionNames = map(suggestions, (_) =>
                      ui5NodeToFQN(_.ui5Node)
                    );
                    expect(suggestionNames).to.deep.equalInAnyOrder([
                      "sap.ui.core.ComponentContainer",
                      "sap.ui.core.HTML",
                      "sap.ui.core.Icon",
                      "sap.ui.core.InvisibleText",
                      "sap.ui.core.LocalBusyIndicator",
                      "sap.ui.core.ScrollBar",
                    ]);
                    expect(suggestionNames).to.not.include(
                      "sap.ui.core.mvc.View"
                    );
                  },
                });
              });
            }
          );
        });
      });
    });

    context("none applicable scenarios", () => {
      it("will offer no suggestions which are abstract classes", () => {
        const xmlSnippet = `
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m">
               <mvc:layoutData>
                <ComboBox⇶
              </mvc:layoutData>
            </mvc:View>`;

        testSuggestionsScenario({
          context: appContext,
          xmlText: xmlSnippet,
          providers: {
            elementName: [classesSuggestions],
          },
          assertion: (suggestions) => {
            expect(ui5Model.classes).to.have.property("sap.m.ComboBoxBase");
            expect(ui5Model.classes["sap.m.ComboBoxBase"].abstract).to.be.true;
            assertSuggestionProperties(suggestions, "layoutData");
            const suggestionNames = map(suggestions, (_) =>
              ui5NodeToFQN(_.ui5Node)
            );
            expect(suggestionNames).to.not.include("sap.m.ComboBoxBase");
          },
        });
      });

      it("will offer no suggestions in an aggregation with cardinality 0..1 which is already 'full'", () => {
        const xmlSnippet = `
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m">
              <mvc:layoutData>
                <⇶
                <ToolbarLayoutData>
                </ToolbarLayoutData>
              </mvc:layoutData>
            </mvc:View>`;

        testSuggestionsScenario({
          context: appContext,
          xmlText: xmlSnippet,
          providers: {
            elementName: [classesSuggestions],
          },
          assertion: (suggestions) => {
            expect(suggestions).to.be.empty;
          },
        });
      });

      it("will offer no suggestions when under a tag with an empty name", () => {
        const xmlSnippet = `
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m">
              <>
                <⇶
              </>
            </mvc:View>`;

        testSuggestionsScenario({
          context: appContext,
          xmlText: xmlSnippet,
          providers: {
            elementName: [classesSuggestions],
          },
          assertion: (suggestions) => {
            expect(suggestions).to.be.empty;
          },
        });
      });

      it("will offer no suggestions when under a tag with only namespace", () => {
        const xmlSnippet = `
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m">
              <mvc:>
                <⇶
              </mvc:>
            </mvc:View>`;

        testSuggestionsScenario({
          context: appContext,
          xmlText: xmlSnippet,
          providers: {
            elementName: [classesSuggestions],
          },
          assertion: (suggestions) => {
            expect(suggestions).to.be.empty;
          },
        });
      });

      it("will offer no suggestion when the parent tag is not a recognized class or aggreation", () => {
        const xmlSnippet = `
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m">
              <_ActionSheet>
                <⇶
              </_ActionSheet>
            </mvc:View>`;

        testSuggestionsScenario({
          context: appContext,
          xmlText: xmlSnippet,
          providers: {
            elementName: [classesSuggestions],
          },
          assertion: (suggestions) => {
            expect(suggestions).to.be.empty;
          },
        });
      });

      it("will offer no suggestions inside an explicit aggregation when the matching UI5 class in unrecognized", () => {
        const xmlSnippet = `
            <mvc:ViewTypo
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m">
              <mvc:layoutData>
                <⇶
              </mvc:layoutData>
            </mvc:ViewTypo>`;

        testSuggestionsScenario({
          context: appContext,
          xmlText: xmlSnippet,
          providers: {
            elementName: [classesSuggestions],
          },
          assertion: (suggestions) => {
            expect(suggestions).to.be.empty;
          },
        });
      });

      it("will offer no suggestions inside an explicit aggregation when the aggregation name is not recognized", () => {
        const xmlSnippet = `
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m">
              <mvc:layoutDataTypo>
                <⇶
              </mvc:layoutDataTypo>
            </mvc:View>`;

        testSuggestionsScenario({
          context: appContext,
          xmlText: xmlSnippet,
          providers: {
            elementName: [classesSuggestions],
          },
          assertion: (suggestions) => {
            expect(suggestions).to.be.empty;
          },
        });
      });

      it("will offer no suggestions inside an explicit aggregation when the aggregation namespace is not recognized", () => {
        const xmlSnippet = `
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m">
              <mvcTypo:layoutData>
                <⇶
              </mvcTypo:layoutData>
            </mvc:View>`;

        testSuggestionsScenario({
          context: appContext,
          xmlText: xmlSnippet,
          providers: {
            elementName: [classesSuggestions],
          },
          assertion: (suggestions) => {
            expect(suggestions).to.be.empty;
          },
        });
      });

      it("will offer no suggestions inside an explicit aggregation when the prefix has an invalid URI", () => {
        const xmlSnippet = `
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc">
              <mvc:layoutData>
                <mvcTypo:⇶
              </mvc:layoutData>
            </mvc:View>`;

        testSuggestionsScenario({
          context: appContext,
          xmlText: xmlSnippet,
          providers: {
            elementName: [classesSuggestions],
          },
          assertion: (suggestions) => {
            expect(suggestions).to.be.empty;
          },
        });
      });

      it("will offer no suggestions inside an explicit aggregation when the aggregation type is not a UI5Class or UI5Interface", () => {
        const clonedModel = cloneDeep(appContext);
        const viewClass = clonedModel.ui5Model.classes["sap.ui.core.mvc.View"];
        const contentAggregation = find(
          viewClass.aggregations,
          (_) => _.name === "content"
        ) as UI5Aggregation;
        expect(contentAggregation).to.exist;
        const contentWithInvalidType = clone(contentAggregation);
        contentWithInvalidType.type = undefined;
        viewClass.aggregations = [contentWithInvalidType];

        const xmlSnippet = `
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m">
              <mvc:content>
                <⇶
              </mvc:content>
            </mvc:View>`;

        testSuggestionsScenario({
          context: clonedModel,
          xmlText: xmlSnippet,
          providers: {
            elementName: [classesSuggestions],
          },
          assertion: (suggestions) => {
            expect(suggestions).to.be.empty;
          },
        });
      });

      it("will offer no suggestions inside a default (implicit) aggregation when the matching UI5 class in unrecognized", () => {
        const xmlSnippet = `
            <mvc:ViewTypo
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m">
                <⇶
            </mvc:ViewTypo>`;

        testSuggestionsScenario({
          context: appContext,
          xmlText: xmlSnippet,
          providers: {
            elementName: [classesSuggestions],
          },
          assertion: (suggestions) => {
            expect(suggestions).to.be.empty;
          },
        });
      });

      it("will offer no suggestions inside a default (implicit) aggregation when the aggregation type is not a UI5Class or UI5Interface", () => {
        const clonedModel = cloneDeep(appContext);
        const carouselClass = clonedModel.ui5Model.classes["sap.m.Carousel"];
        const pagesAggregation = find(
          carouselClass.aggregations,
          (_) => _.name === "pages"
        ) as UI5Aggregation;
        // TODO: can we do supply better type signatures for chai.expect?
        expect(pagesAggregation).to.exist;
        expect(carouselClass.defaultAggregation?.name).to.equal(
          pagesAggregation?.name
        );
        const pagesWithInvalidType = clone(pagesAggregation);
        pagesWithInvalidType.type = undefined;
        carouselClass.aggregations = [pagesWithInvalidType];
        carouselClass.defaultAggregation = pagesWithInvalidType;

        const xmlSnippet = `
            <Carousel
              xmlns="sap.m">
                <⇶
            </Carousel>`;

        testSuggestionsScenario({
          context: clonedModel,
          xmlText: xmlSnippet,
          providers: {
            elementName: [classesSuggestions],
          },
          assertion: (suggestions) => {
            expect(suggestions).to.be.empty;
          },
        });
      });
    });
  });
});

function assertSuggestionProperties(
  suggestions: UI5XMLViewCompletion[],
  expectedParentTag: string | undefined
): asserts suggestions is UI5ClassesInXMLTagNameCompletion[] {
  forEach(suggestions, (_) => {
    expect(_.type).to.equal(`UI5ClassesInXMLTagName`);
    expect(_.ui5Node.kind).to.equal("UI5Class");
    expect(_.astNode.type).to.equal("XMLElement");
    if (expectedParentTag === undefined) {
      expect(_.astNode.parent.type).to.equal("XMLDocument");
    } else {
      expect(_.astNode.parent.type).to.equal("XMLElement");
      expect((_.astNode.parent as XMLElement).name).to.equal(expectedParentTag);
    }
  });
}
