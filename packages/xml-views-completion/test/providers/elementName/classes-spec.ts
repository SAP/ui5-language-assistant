import { expect } from "chai";
import { clone, cloneDeep, find, forEach, map } from "lodash";
import { XMLElement } from "@xml-tools/ast";

import {
  UI5Aggregation,
  UI5Class,
  UI5SemanticModel
} from "@ui5-editor-tools/semantic-model-types";
import { generateModel } from "@ui5-editor-tools/test-utils";

import { classesSuggestions } from "../../../src/providers/elementName/classes";
import { testSuggestionsScenario } from "../../utils";
import { getSuperClasses, ui5NodeToFQN } from "@ui5-editor-tools/logic-utils";
import { UI5XMLViewCompletion } from "../../../api";

const ui5Model: UI5SemanticModel = generateModel("1.74.0");

describe("The ui5-editor-tools xml-views-completion", () => {
  context("UI5 Classes Suggestions", () => {
    context("applicable scenarios", () => {
      context("classes at the document's root", () => {
        context("no prefix", () => {
          it("will suggest **all** Controls at the top level", () => {
            const xmlSnippet = `
              <⇶
            `;

            testSuggestionsScenario({
              model: ui5Model,
              xmlText: xmlSnippet,
              providers: {
                elementName: [classesSuggestions]
              },
              assertion: suggestions => {
                const baseControl = ui5Model.classes["sap.ui.core.Control"];
                expect(suggestions).to.have.length.greaterThan(200);
                forEach(suggestions, _ => {
                  expect(_.ui5Node.kind).to.equal("UI5Class");
                  const superClasses = getSuperClasses(_.ui5Node as UI5Class);
                  // Chai's `.include` is super slow, we must implement it ourselves...
                  const doesSuggestionExtendsControl =
                    find(superClasses, baseControl) !== undefined;
                  expect(
                    doesSuggestionExtendsControl || _.ui5Node === baseControl
                  ).to.be.true;
                });
              }
            });
          });
        });

        context("prefix without xmlns", () => {
          it("will suggest **only** classes matching `sap.ui.core.Control` (not Element) type and the **prefix**", () => {
            const xmlSnippet = `
              <QuickView⇶
            `;

            testSuggestionsScenario({
              model: ui5Model,
              xmlText: xmlSnippet,
              providers: {
                elementName: [classesSuggestions]
              },
              assertion: suggestions => {
                const suggestionNames = map(suggestions, _ =>
                  ui5NodeToFQN(_.ui5Node)
                );
                expect(suggestionNames).to.deep.equalInAnyOrder([
                  "sap.m.QuickView",
                  "sap.m.QuickViewBase",
                  "sap.m.QuickViewCard",
                  "sap.m.QuickViewPage",
                  "sap.ui.ux3.QuickView"
                ]);

                const quickViewGroup = ui5Model.classes["sap.m.QuickViewGroup"];
                expect(quickViewGroup).to.exist;
                expect(quickViewGroup.extends).to.equal(
                  ui5Model.classes["sap.ui.core.Element"]
                );
                expect(suggestionNames).to.not.include([
                  "sap.m.QuickViewGroup"
                ]);
              }
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
              model: ui5Model,
              xmlText: xmlSnippet,
              providers: {
                elementName: [classesSuggestions]
              },
              assertion: suggestions => {
                const suggestionNames = map(suggestions, _ =>
                  ui5NodeToFQN(_.ui5Node)
                );
                // Can "manually" traverse expected graph of `sap.m.Button` subClasses here:
                //   - https://openui5.hana.ondemand.com/1.74.0/#/api/sap.m.Button
                expect(suggestionNames).to.deep.equalInAnyOrder([
                  "sap.m.Button",
                  "sap.m.OverflowToolbarButton",
                  "sap.m.OverflowToolbarToggleButton",
                  "sap.m.ToggleButton",
                  "sap.uxap.ObjectPageHeaderActionButton"
                ]);
                assertSuggestionProperties({
                  suggestions,
                  expectedParentTag: "ActionSheet"
                });
              }
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
              model: ui5Model,
              xmlText: xmlSnippet,
              providers: {
                elementName: [classesSuggestions]
              },
              assertion: suggestions => {
                const suggestionNames = map(suggestions, _ =>
                  ui5NodeToFQN(_.ui5Node)
                );
                // Can "manually" traverse expected graph of `sap.m.Button` subClasses here:
                //   - https://ui5.sap.com/1.74.0/#/api/sap.m.Button
                expect(suggestionNames).to.deep.equalInAnyOrder([
                  "sap.m.OverflowToolbarButton",
                  "sap.m.OverflowToolbarToggleButton"
                ]);
                assertSuggestionProperties({
                  suggestions,
                  expectedParentTag: "ActionSheet"
                });
              }
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
              model: ui5Model,
              xmlText: xmlSnippet,
              providers: {
                elementName: [classesSuggestions]
              },
              assertion: suggestions => {
                const suggestionNames = map(suggestions, _ =>
                  ui5NodeToFQN(_.ui5Node)
                );
                // Can "manually" traverse expected graph of `sap.m.Button` subClasses here:
                //   - https://ui5.sap.com/1.74.0/#/api/sap.m.Button
                expect(suggestionNames).to.deep.equalInAnyOrder([
                  "sap.m.OverflowToolbarButton",
                  "sap.m.OverflowToolbarToggleButton"
                ]);
                assertSuggestionProperties({
                  suggestions,
                  expectedParentTag: "ActionSheet"
                });
              }
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
              <layoutData>
                <⇶
              </layoutData>
            </mvc:View>`;

            testSuggestionsScenario({
              model: ui5Model,
              xmlText: xmlSnippet,
              providers: {
                elementName: [classesSuggestions]
              },
              assertion: suggestions => {
                const suggestionNames = map(suggestions, _ =>
                  ui5NodeToFQN(_.ui5Node)
                );
                // Can "manually" traverse expected graph of `sap.ui.core.LayoutData` subClasses here:
                //   - https://openui5.hana.ondemand.com/1.74.0/#/api/sap.ui.core.LayoutData
                expect(suggestionNames).to.deep.equalInAnyOrder([
                  "sap.ui.core.LayoutData",
                  "sap.ui.core.VariantLayoutData",
                  "sap.f.GridContainerItemLayoutData",
                  "sap.m.FlexItemData",
                  "sap.m.ToolbarLayoutData",
                  "sap.m.OverflowToolbarLayoutData",
                  "sap.ui.layout.BlockLayoutCellData",
                  "sap.ui.layout.cssgrid.GridItemLayoutData",
                  "sap.ui.layout.cssgrid.ResponsiveColumnItemLayoutData",
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
                  "sap.uxap.ObjectPageHeaderLayoutData"
                ]);
                assertSuggestionProperties({
                  suggestions,
                  expectedParentTag: "layoutData"
                });
              }
            });
          });
        });

        context("prefix without xmlns", () => {
          it("will suggest **all** classes matching the type of the **explicit aggregation**", () => {
            const xmlSnippet = `
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m">
              <layoutData>
                <GridContainer⇶
              </layoutData>
            </mvc:View>`;

            testSuggestionsScenario({
              model: ui5Model,
              xmlText: xmlSnippet,
              providers: {
                elementName: [classesSuggestions]
              },
              assertion: suggestions => {
                const suggestionNames = map(suggestions, _ =>
                  ui5NodeToFQN(_.ui5Node)
                );
                // Can "manually" traverse expected graph of `sap.ui.core.LayoutData` subClasses here:
                //   - https://openui5.hana.ondemand.com/1.74.0/#/api/sap.ui.core.LayoutData
                expect(suggestionNames).to.deep.equalInAnyOrder([
                  "sap.f.GridContainerItemLayoutData",
                  "sap.ui.layout.form.GridContainerData",
                  "sap.ui.commons.form.GridContainerData"
                ]);
                assertSuggestionProperties({
                  suggestions,
                  expectedParentTag: "layoutData"
                });
              }
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
              <layoutData>
                <forms:GridContainer⇶
              </layoutData>
            </mvc:View>`;

              testSuggestionsScenario({
                model: ui5Model,
                xmlText: xmlSnippet,
                providers: {
                  elementName: [classesSuggestions]
                },
                assertion: suggestions => {
                  const suggestionNames = map(suggestions, _ =>
                    ui5NodeToFQN(_.ui5Node)
                  );
                  // Can "manually" traverse expected graph of `sap.ui.core.LayoutData` subClasses here:
                  //   - https://openui5.hana.ondemand.com/1.74.0/#/api/sap.ui.core.LayoutData
                  expect(suggestionNames).to.deep.equalInAnyOrder([
                    "sap.ui.commons.form.GridContainerData"
                  ]);
                  assertSuggestionProperties({
                    suggestions,
                    expectedParentTag: "layoutData"
                  });
                }
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
              <layoutData>
                <forms:⇶
              </layoutData>
            </mvc:View>`;

                testSuggestionsScenario({
                  model: ui5Model,
                  xmlText: xmlSnippet,
                  providers: {
                    elementName: [classesSuggestions]
                  },
                  assertion: suggestions => {
                    const suggestionNames = map(suggestions, _ =>
                      ui5NodeToFQN(_.ui5Node)
                    );
                    // Can "manually" traverse expected graph of `sap.ui.core.LayoutData` subClasses here:
                    //   - https://openui5.hana.ondemand.com/1.74.0/#/api/sap.ui.core.LayoutData
                    expect(suggestionNames).to.deep.equalInAnyOrder([
                      "sap.ui.commons.form.GridContainerData",
                      "sap.ui.commons.form.GridElementData"
                    ]);
                    assertSuggestionProperties({
                      suggestions,
                      expectedParentTag: "layoutData"
                    });
                  }
                });
              });
            }
          );
        });
      });
    });

    context("none applicable scenarios", () => {
      it("will offer no suggestions in an aggregation with cardinality 0..1 which is already 'full'", () => {
        const xmlSnippet = `
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m">
              <layoutData>
                <⇶
                <ToolbarLayoutData>
                </ToolbarLayoutData>
              </layoutData>
            </mvc:View>`;

        testSuggestionsScenario({
          model: ui5Model,
          xmlText: xmlSnippet,
          providers: {
            elementName: [classesSuggestions]
          },
          assertion: suggestions => {
            expect(suggestions).to.be.empty;
          }
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
          model: ui5Model,
          xmlText: xmlSnippet,
          providers: {
            elementName: [classesSuggestions]
          },
          assertion: suggestions => {
            expect(suggestions).to.be.empty;
          }
        });
      });

      it("will offer no suggestion when an aggregation's parent tag does not start with upper case character", () => {
        const xmlSnippet = `
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m">
              <_ActionSheet>
                <⇶
              </_ActionSheet>
            </mvc:View>`;

        testSuggestionsScenario({
          model: ui5Model,
          xmlText: xmlSnippet,
          providers: {
            elementName: [classesSuggestions]
          },
          assertion: suggestions => {
            const suggestionNames = map(suggestions, _ =>
              ui5NodeToFQN(_.ui5Node)
            );
            expect(suggestionNames).to.be.empty;
          }
        });
      });

      it("will offer no suggestions inside an explicit aggregation when the matching UI5 class in unrecognized", () => {
        const xmlSnippet = `
            <mvc:ViewTypo
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m">
              <layoutData>
                <⇶
              </layoutData>
            </mvc:ViewTypo>`;

        testSuggestionsScenario({
          model: ui5Model,
          xmlText: xmlSnippet,
          providers: {
            elementName: [classesSuggestions]
          },
          assertion: suggestions => {
            expect(suggestions).to.be.empty;
          }
        });
      });

      it("will offer no suggestions inside an explicit aggregation when the aggregation name is not recognized", () => {
        const xmlSnippet = `
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m">
              <layoutDataTypo>
                <⇶
              </layoutDataTypo>
            </mvc:View>`;

        testSuggestionsScenario({
          model: ui5Model,
          xmlText: xmlSnippet,
          providers: {
            elementName: [classesSuggestions]
          },
          assertion: suggestions => {
            expect(suggestions).to.be.empty;
          }
        });
      });

      it("will offer no suggestions inside an explicit aggregation when the prefix has an invalid URI", () => {
        const xmlSnippet = `
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc">
              <layoutData>
                <mvcTypo:⇶
              </layoutData>
            </mvc:View>`;

        testSuggestionsScenario({
          model: ui5Model,
          xmlText: xmlSnippet,
          providers: {
            elementName: [classesSuggestions]
          },
          assertion: suggestions => {
            expect(suggestions).to.be.empty;
          }
        });
      });

      it("will offer no suggestions inside an explicit aggregation when the aggregation type is not a UI5Class or UI5Interface", () => {
        const clonedModel = cloneDeep(ui5Model);
        const viewClass = clonedModel.classes["sap.ui.core.mvc.View"];
        const contentAggregation = find(
          viewClass.aggregations,
          _ => _.name === "content"
        ) as UI5Aggregation;
        expect(contentAggregation).to.exist;
        const contentWithInvalidType = clone(contentAggregation);
        contentWithInvalidType.type = undefined;
        viewClass.aggregations = [contentWithInvalidType];

        const xmlSnippet = `
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m">
              <content>
                <⇶
              </content>
            </mvc:View>`;

        testSuggestionsScenario({
          model: clonedModel,
          xmlText: xmlSnippet,
          providers: {
            elementName: [classesSuggestions]
          },
          assertion: suggestions => {
            expect(suggestions).to.be.empty;
          }
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
          model: ui5Model,
          xmlText: xmlSnippet,
          providers: {
            elementName: [classesSuggestions]
          },
          assertion: suggestions => {
            expect(suggestions).to.be.empty;
          }
        });
      });

      it("will offer no suggestions inside a default (implicit) aggregation when the aggregation type is not a UI5Class or UI5Interface", () => {
        const clonedModel = cloneDeep(ui5Model);
        const carouselClass = clonedModel.classes["sap.m.Carousel"];
        const pagesAggregation = find(
          carouselClass.aggregations,
          _ => _.name === "pages"
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
          model: clonedModel,
          xmlText: xmlSnippet,
          providers: {
            elementName: [classesSuggestions]
          },
          assertion: suggestions => {
            expect(suggestions).to.be.empty;
          }
        });
      });
    });
  });
});

function assertSuggestionProperties({
  suggestions,
  expectedParentTag
}: {
  suggestions: UI5XMLViewCompletion[];
  expectedParentTag: string;
}): void {
  forEach(suggestions, _ => {
    expect(_.type).to.equal(`UI5ClassesInXMLTagName`);
    expect(_.ui5Node.kind).to.equal("UI5Class");
    expect(_.astNode.type).to.equal("XMLElement");
    expect((_.astNode.parent as XMLElement).name).to.equal(expectedParentTag);
  });
}
