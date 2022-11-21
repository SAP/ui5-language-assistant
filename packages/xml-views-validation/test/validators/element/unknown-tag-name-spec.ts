import { expect } from "chai";
import { partial } from "lodash";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { generateModel } from "@ui5-language-assistant/test-utils";
import { generate } from "@ui5-language-assistant/semantic-model";
import {
  validations,
  buildMessage,
} from "@ui5-language-assistant/user-facing-text";
import { validators } from "../../../src/api";
import {
  assertNoIssues as assertNoIssuesBase,
  assertSingleIssue as assertSingleIssueBase,
  testValidationsScenario,
  computeExpectedRanges,
  getDefaultContext,
} from "../../test-utils";
import { Context as AppContext } from "@ui5-language-assistant/context";

const {
  UNKNOWN_CLASS_IN_NS,
  UNKNOWN_CLASS_WITHOUT_NS,
  UNKNOWN_AGGREGATION_IN_CLASS,
  UNKNOWN_AGGREGATION_IN_CLASS_DIFF_NAMESPACE,
  UNKNOWN_TAG_NAME_IN_CLASS,
  UNKNOWN_TAG_NAME_IN_NS_UNDER_CLASS,
  UNKNOWN_TAG_NAME_IN_NS,
  UNKNOWN_TAG_NAME_NO_NS,
} = validations;

describe("the unknown tag name validation", () => {
  let ui5SemanticModel: UI5SemanticModel;
  let appContext: AppContext;
  before(async () => {
    ui5SemanticModel = await generateModel({
      framework: "SAPUI5",
      version: "1.71.49",
      modelGenerator: generate,
    });
    appContext = getDefaultContext(ui5SemanticModel);
  });

  context("true positive scenarios", () => {
    let assertSingleIssue: (xmlSnippet: string, message: string) => void;
    before(() => {
      assertSingleIssue = partial(
        assertSingleIssueBase,
        appContext,
        {
          element: [validators.validateUnknownTagName],
        },
        "UnknownTagName",
        "error"
      );
    });

    context("tag with namespace", () => {
      it("will detect an invalid class name in root tag", () => {
        assertSingleIssue(
          `<🢂mvc:View_TYPO🢀
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m">
          </mvc:View_TYPO>`,
          buildMessage(UNKNOWN_CLASS_IN_NS.msg, "View_TYPO", "sap.ui.core.mvc")
        );
      });

      it("will detect an invalid class name under class that has default aggregation", () => {
        assertSingleIssue(
          `<mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns:m="sap.m">
            <🢂m:Button_TYPO🢀>
            </m:Button_TYPO>
          </mvc:View>`,
          buildMessage(UNKNOWN_CLASS_IN_NS.msg, "Button_TYPO", "sap.m")
        );
      });

      it("will detect an invalid class name under class that doesn't have a default aggregation", () => {
        assertSingleIssue(
          `<mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns:m="sap.m">
            <m:SplitApp>
              <🢂m:Button_TYPO🢀>
              </m:Button_TYPO>
            </m:SplitApp>
          </mvc:View>`,
          buildMessage(
            UNKNOWN_TAG_NAME_IN_NS_UNDER_CLASS.msg,
            "Button_TYPO",
            "sap.m",
            "sap.m.SplitApp"
          )
        );
      });

      it("will detect an invalid class name under aggregation", () => {
        assertSingleIssue(
          `<mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns:m="sap.m">
            <mvc:content>
              <🢂m:Button_TYPO🢀>
              </m:Button_TYPO>
            </mvc:content>
          </mvc:View>`,
          buildMessage(UNKNOWN_CLASS_IN_NS.msg, "Button_TYPO", "sap.m")
        );
      });

      it("will detect an invalid aggregation when it's in the wrong namespace", () => {
        assertSingleIssue(
          `<mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns:m="sap.m">
            <🢂m:content🢀>
            </mv:content>
          </mvc:View>`,
          buildMessage(UNKNOWN_CLASS_IN_NS.msg, "content", "sap.m")
        );
      });

      it("will detect an invalid class name under aggregation in the same namespace", () => {
        assertSingleIssue(
          `<mvc:View
            xmlns:mvc="sap.ui.core.mvc">
            <mvc:content>
              <🢂mvc:Button_TYPO🢀>
              </mvc:Button_TYPO>
            </mvc:content>
          </mvc:View>`,
          buildMessage(
            UNKNOWN_CLASS_IN_NS.msg,
            "Button_TYPO",
            "sap.ui.core.mvc"
          )
        );
      });

      it("will detect an invalid aggregation name under known class tag without default aggregation", () => {
        assertSingleIssue(
          `<mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns:m="sap.m">
            <m:SplitApp>
              <🢂m:content_TYPO🢀>
              </m:content_TYPO>
            </m:SplitApp>
          </mvc:View>`,
          buildMessage(
            UNKNOWN_TAG_NAME_IN_NS_UNDER_CLASS.msg,
            "content_TYPO",
            "sap.m",
            "sap.m.SplitApp"
          )
        );
      });

      it("will detect an issue for unknown name under unknown class in a known namespace", () => {
        const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns:m="sap.m">
            <🢂m:SplitApp_TYPO🢀>
              <🢂m:Button_TYPO🢀>
              </m:Button_TYPO>
            </m:SplitApp_TYPO>
          </mvc:View>`;
        const expectedRanges = computeExpectedRanges(xmlSnippet);

        testValidationsScenario({
          context: appContext,
          xmlText: xmlSnippet,
          validators: { element: [validators.validateUnknownTagName] },
          assertion: (issues) => {
            expect(issues).to.deep.equalInAnyOrder([
              {
                kind: "UnknownTagName",
                message: buildMessage(
                  UNKNOWN_CLASS_IN_NS.msg,
                  "SplitApp_TYPO",
                  "sap.m"
                ),
                offsetRange: expectedRanges[0],
                severity: "error",
              },
              {
                kind: "UnknownTagName",
                message: buildMessage(
                  UNKNOWN_TAG_NAME_IN_NS.msg,
                  "Button_TYPO",
                  "sap.m"
                ),
                offsetRange: expectedRanges[1],
                severity: "error",
              },
            ]);
          },
        });
      });
    });

    context("tag without namespace", () => {
      context("when default namespace is not defined", () => {
        it("will detect an invalid class name in root tag", () => {
          assertSingleIssue(
            `<🢂View🢀>
            </View>`,
            buildMessage(UNKNOWN_CLASS_WITHOUT_NS.msg, "View")
          );
        });

        it("will detect an invalid class name under known aggregation tag", () => {
          assertSingleIssue(
            `<mvc:View
              xmlns:mvc="sap.ui.core.mvc">
              <mvc:content>
                <🢂List🢀></List>
              </mvc:content>
            </mvc:View>`,
            buildMessage(UNKNOWN_CLASS_WITHOUT_NS.msg, "List")
          );
        });

        it("will detect an invalid class or aggregation name under known class tag with default aggregation", () => {
          assertSingleIssue(
            `<mvc:View
              xmlns:mvc="sap.ui.core.mvc">
              <🢂List🢀></List>
            </mvc:View>`,
            buildMessage(
              UNKNOWN_TAG_NAME_IN_CLASS.msg,
              "List",
              "sap.ui.core.mvc.View"
            )
          );
        });

        it("will detect an invalid aggregation namespace under known class tag without default aggregation", () => {
          assertSingleIssue(
            `<mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns:m="sap.m">
              <m:SplitApp>
                <🢂content🢀>
                </content>
              </m:SplitApp>
            </mvc:View>`,
            buildMessage(
              UNKNOWN_AGGREGATION_IN_CLASS_DIFF_NAMESPACE.msg,
              "content",
              "sap.m.SplitApp"
            )
          );
        });

        it("will detect an issue for unknown name under unknown class in non-default non-ui5 namespace when name starts with uppercase", () => {
          assertSingleIssue(
            `<mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns:typo="sap.m_TYPO">
              <typo:SplitApp>
                <🢂Button_TYPO🢀>
                </Button_TYPO>
              </typo:SplitApp>
            </mvc:View>`,
            buildMessage(UNKNOWN_TAG_NAME_NO_NS.msg, "Button_TYPO")
          );
        });
      });

      context("when default namespace is a ui5 namespace", () => {
        it("will detect an issue for unknown name under unknown class in the default namespace", () => {
          const xmlSnippet = `
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m">
              <🢂SplitApp_TYPO🢀>
                <🢂Button_TYPO🢀>
                </Button_TYPO>
              </SplitApp_TYPO>
            </mvc:View>`;
          const expectedRanges = computeExpectedRanges(xmlSnippet);

          testValidationsScenario({
            context: appContext,
            xmlText: xmlSnippet,
            validators: { element: [validators.validateUnknownTagName] },
            assertion: (issues) => {
              expect(issues).to.deep.equalInAnyOrder([
                {
                  kind: "UnknownTagName",
                  message: buildMessage(
                    UNKNOWN_TAG_NAME_IN_NS_UNDER_CLASS.msg,
                    "SplitApp_TYPO",
                    "sap.m",
                    "sap.ui.core.mvc.View"
                  ),
                  offsetRange: expectedRanges[0],
                  severity: "error",
                },
                {
                  kind: "UnknownTagName",
                  message: buildMessage(
                    UNKNOWN_TAG_NAME_IN_NS.msg,
                    "Button_TYPO",
                    "sap.m"
                  ),
                  offsetRange: expectedRanges[1],
                  severity: "error",
                },
              ]);
            },
          });
        });
      });
    });

    context("when default namespace is a ui5 namespace", () => {
      it("will detect an invalid class name in root tag", () => {
        assertSingleIssue(
          `<🢂View_TYPO🢀
            xmlns="sap.ui.core.mvc">
          </View_TYPO>`,
          buildMessage(UNKNOWN_CLASS_IN_NS.msg, "View_TYPO", "sap.ui.core.mvc")
        );
      });

      it("will detect an invalid class name under known aggregation tag", () => {
        assertSingleIssue(
          `<View
            xmlns="sap.ui.core.mvc">
            <content>
              <🢂List_TYPO🢀></List_TYPO>
            </content>
          </View>`,
          buildMessage(UNKNOWN_CLASS_IN_NS.msg, "List_TYPO", "sap.ui.core.mvc")
        );
      });

      it("will detect an invalid class or aggregation name under known class tag with default aggregation", () => {
        assertSingleIssue(
          `<View
            xmlns="sap.ui.core.mvc">
            <🢂List_TYPO🢀></List_TYPO>
          </View>`,
          buildMessage(
            UNKNOWN_TAG_NAME_IN_NS_UNDER_CLASS.msg,
            "List_TYPO",
            "sap.ui.core.mvc",
            "sap.ui.core.mvc.View"
          )
        );
      });

      it("will detect an invalid aggregation name under known class tag without default aggregation", () => {
        assertSingleIssue(
          `<mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m">
            <SplitApp>
              <🢂content_TYPO🢀>
              </content_TYPO>
            </SplitApp>
          </mvc:View>`,
          buildMessage(
            UNKNOWN_AGGREGATION_IN_CLASS.msg,
            "content_TYPO",
            "sap.m.SplitApp"
          )
        );
      });
    });
  });

  context("negative edge cases", () => {
    let assertNoIssues: (xmlSnippet: string) => void;
    before(() => {
      assertNoIssues = partial(assertNoIssuesBase, appContext, {
        element: [validators.validateUnknownTagName],
      });
    });

    context("tag with namespace", () => {
      context("non-ui5 namespace", () => {
        it("will not detect an issue when namespace is unknown", () => {
          assertNoIssues(
            `<mvc:View_TYPO
              xmlns:mvc="sap.ui.core.mvc_TYPO"
              xmlns="sap.m">
            </mvc:View_TYPO>`
          );
        });

        it("will not detect an issue when namespace is xhtml", () => {
          assertNoIssues(
            `<mvc:View_TYPO
              xmlns:mvc="http://www.w3.org/1999/xhtml"
              xmlns="sap.m">
            </mvc:View_TYPO>`
          );
        });

        it("will not detect an issue when namespace is not defined in xmlns attribute", () => {
          assertNoIssues(
            `<mvc:View_TYPO
              xmlns="sap.m">
            </mvc:View_TYPO>`
          );
        });
      });

      context("ui5 namespace", () => {
        let assertSingleIssue: (xmlSnippet: string, message: string) => void;
        before(() => {
          assertSingleIssue = partial(
            assertSingleIssueBase,
            appContext,
            {
              element: [validators.validateUnknownTagName],
            },
            "UnknownTagName",
            "error"
          );
        });
        it("will not detect an issue for known class in the root tag", () => {
          assertNoIssues(
            `<mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m">
            </mvc:View>`
          );
        });

        it("will not detect an issue for sap.ui.core.FragmentDefinition in the root tag", () => {
          assertNoIssues(
            `<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core">
                <Label text="These controls are within one multi-root Fragment:" />
                <Input />
                <Button text="Still in the same Fragment" />
            </core:FragmentDefinition>`
          );
        });

        it("will not detect an issue for known aggregation in a different namespace prefix that references the same namespace", () => {
          assertNoIssues(
            `<mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns:mvc2="sap.ui.core.mvc">
              <mvc2:content>
              </mvc2:content>
            </mvc:View>`
          );
        });

        it("will not detect an issue for known class under class that has default aggregation", () => {
          assertNoIssues(
            `<mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns:m="sap.m">
              <m:Button>
              </m:Button>
            </mvc:View>`
          );
        });

        it("will not detect an issue for known class under class that doesn't have a default aggregation", () => {
          assertNoIssues(
            `<mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns:m="sap.m">
              <m:SplitApp>
                <m:Button>
                </m:Button>
              </m:SplitApp>
            </mvc:View>`
          );
        });

        it("will not detect an issue for known class under aggregation", () => {
          assertNoIssues(
            `<mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns:m="sap.m">
              <mvc:content>
                <m:Button>
                </m:Button>
              </mvc:content>
            </mvc:View>`
          );
        });

        it("will not detect an issue for known class under tag in unknown namespace", () => {
          assertNoIssues(
            `<mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns:m="sap.m"
              xmlns:customns="customns">
              <customns:SplitApp>
                <m:Button>
                </m:Button>
              </customns:SplitApp>
            </mvc:View>`
          );
        });

        it("will not detect an issue for known class under tag in unknown default namespace", () => {
          assertNoIssues(
            `<mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns:m="sap.m"
              xmlns="customns">
              <SplitApp>
                <m:Button>
                </m:Button>
              </SplitApp>
            </mvc:View>`
          );
        });

        it("will not detect an issue for sap.ui.core.ExtensionPoint as top level element in sap.ui.core.mvc.View", () => {
          assertNoIssues(
            `<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core">
                <core:ExtensionPoint name="extension1"/>
            </mvc:View>`
          );
        });

        it("will not detect an issue for sap.ui.core.ExtensionPoint as top level element in sap.ui.core.Fragment", () => {
          assertNoIssues(
            `<FragmentDefinition xmlns="sap.ui.core">
                <ExtensionPoint name="extension1"/>
            </FragmentDefinition>`
          );
        });

        it("will not detect an issue for sap.ui.core.ExtensionPoint as nested element in sap.ui.core.mvc.View", () => {
          assertNoIssues(
            `<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core" xmlns:m="sap.m">
                <m:Page>
                  <m:content>
                    <core:ExtensionPoint name="extension1"/>
                  </m:content>
                </m:Page>
            </mvc:View>`
          );
        });

        it("will not detect an issue for sap.ui.core.ExtensionPoint as nested element in sap.ui.core.Fragment", () => {
          assertNoIssues(
            `<FragmentDefinition xmlns="sap.ui.core">
              <m:Panel>
                <m:content>
                  <core:ExtensionPoint name="extension1"/>
                </m:content>
              </m:Panel>
            </FragmentDefinition>`
          );
        });

        it("will detect an issue for sap.ui.core.ExtensionPoint in the root tag", () => {
          assertSingleIssue(
            `<🢂ExtensionPoint🢀 name="extension1"></ExtensionPoint>`,
            buildMessage(UNKNOWN_CLASS_WITHOUT_NS.msg, "ExtensionPoint")
          );
        });
      });
    });

    context("tag without namespace", () => {
      context("when default namespace is a ui5 namespace", () => {
        it("will not detect an issue for known class in the root tag", () => {
          assertNoIssues(
            `<View
              xmlns="sap.ui.core.mvc">
            </View>`
          );
        });

        it("will not detect an issue for sap.ui.core.FragmentDefinition in the root tag", () => {
          assertNoIssues(
            `<FragmentDefinition xmlns:m="sap.m" xmlns="sap.ui.core">
                <m:Label text="These controls are within one multi-root Fragment:" />
                <m:Input />
                <m:Button text="Still in the same Fragment" />
            </FragmentDefinition>`
          );
        });

        it("will not detect an issue for known class under known aggregation tag", () => {
          assertNoIssues(
            `<mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m">
              <mvc:content>
                <Button>
                </Button>
              </mvc:content>
            </mvc:View>`
          );
        });

        it("will not detect an issue for known class under known class tag with default aggregation", () => {
          assertNoIssues(
            `<mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m">
              <Button>
              </Button>
            </mvc:View>`
          );
        });

        it("will not detect an issue for known class under known class tag without default aggregation", () => {
          // This should be detected in a different validation
          assertNoIssues(
            `<mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m">
              <SplitApp>
                <Button>
                </Button>
              </SplitApp>
            </mvc:View>`
          );
        });

        it("will not detect an issue for known aggregation under known class tag with default aggregation", () => {
          assertNoIssues(
            `<mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m">
              <mvc:content>
              </mvc:content>
            </mvc:View>`
          );
        });

        it("will not detect an issue for known aggregation under known class tag without default aggregation", () => {
          assertNoIssues(
            `<mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m">
              <SplitApp>
                <masterPages>
                </masterPages>
              </SplitApp>
            </mvc:View>`
          );
        });

        it("will not detect an issue for known class under tag in unknown namespace", () => {
          assertNoIssues(
            `<mvc:View
              xmlns:mvc="sap.ui.core.mvc_TYPO"
              xmlns="sap.m">
              <SplitApp>
              </SplitApp>
            </mvc:View>`
          );
        });

        it("will not detect an issue for unknown name under unknown class in non-ui5 namespace", () => {
          assertNoIssues(
            `<mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns:typo="sap.m_TYPO"
              xmlns="sap.m">
              <typo:SplitApp>
                <typo:content_TYPO>
                </typo:content_TYPO>
              </typo:SplitApp>
            </mvc:View>`
          );
        });
      });

      context("when default namespace is a non-ui5 namespace", () => {
        it("will not detect an issue for unknown name in root tag", () => {
          assertNoIssues(
            `<View_TYPO
              xmlns="sap.ui.core.mvc_TYPO">
            </View_TYPO>`
          );
        });

        it("will not detect an issue for unknown name under known aggregation tag", () => {
          assertNoIssues(
            `<mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m_TYPO">
              <mvc:content>
                <Button_TYPO>
                </Button_TYPO>
              </mvc:content>
            </mvc:View>`
          );
        });

        it("will not detect an issue for unknown name under known class tag with default aggregation", () => {
          assertNoIssues(
            `<mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m_TYPO">
              <Button_TYPO>
              </Button_TYPO>
            </mvc:View>`
          );
        });

        it("will not detect an issue for unknown name under known class tag without default aggregation", () => {
          // The tag might still be allowed if it's not a class, e.g. template tags are allowed everywhere
          assertNoIssues(
            `<mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns:m="sap.m"
              xmlns="sap.m_TYPO">
              <m:SplitApp>
                <Button_TYPO>
                </Button_TYPO>
              </m:SplitApp>
            </mvc:View>`
          );
        });

        it("will not detect an issue for unknown name under unknown class in default non-ui5 namespace when name starts with lowercase", () => {
          assertNoIssues(
            `<mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m_TYPO">
              <SplitApp>
                <content_TYPO>
                </content_TYPO>
              </SplitApp>
            </mvc:View>`
          );
        });

        it("will not detect an issue for unknown name under unknown class in default non-ui5 namespace when name starts with uppercase", () => {
          assertNoIssues(
            `<mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m_TYPO">
              <SplitApp>
                <Button_TYPO>
                </Button_TYPO>
              </SplitApp>
            </mvc:View>`
          );
        });
      });

      context("when default namespace is not defined", () => {
        it("will not detect an issue for tag without a name", () => {
          assertNoIssues(
            `< >
            </View>`
          );
        });

        it("will not detect an issue for unknown name under unknown class in non-default non-ui5 namespace when name starts with lowercase", () => {
          assertNoIssues(
            `<mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns:typo="sap.m_TYPO">
              <typo:SplitApp>
                <typo:content_TYPO>
                </typo:content_TYPO>
              </typo:SplitApp>
            </mvc:View>`
          );
        });
      });
    });
  });
});
