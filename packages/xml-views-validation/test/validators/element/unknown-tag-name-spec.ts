import { expect } from "chai";
import { partial } from "lodash";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { generateModel } from "@ui5-language-assistant/test-utils";
import {
  assertNoIssues as assertNoIssuesBase,
  assertSingleIssue as assertSingleIssueBase,
  testValidationsScenario,
  computeExpectedRanges,
} from "../../test-utils";
import { validateUnknownTagName } from "../../../src/validators/elements/unknown-tag-name";
import {
  getMessage,
  UNKNOWN_CLASS_IN_NS,
  UNKNOWN_CLASS_WITHOUT_NS,
  UNKNOWN_AGGREGATION_IN_CLASS,
  UNKNOWN_AGGREGATION_IN_CLASS_DIFF_NAMESPACE,
  UNKNOWN_TAG_NAME_IN_CLASS,
  UNKNOWN_TAG_NAME_IN_NS_UNDER_CLASS,
  UNKNOWN_TAG_NAME_IN_NS,
  UNKNOWN_TAG_NAME_NO_NS,
} from "../../../src/utils/messages";

describe("the unknown tag name validation", () => {
  let ui5SemanticModel: UI5SemanticModel;

  before(async () => {
    ui5SemanticModel = await generateModel({ version: "1.74.0" });
  });

  context("true positive scenarios", () => {
    let assertSingleIssue: (xmlSnippet: string, message: string) => void;
    before(() => {
      assertSingleIssue = partial(
        assertSingleIssueBase,
        ui5SemanticModel,
        {
          element: [validateUnknownTagName],
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
          getMessage(UNKNOWN_CLASS_IN_NS, "View_TYPO", "sap.ui.core.mvc")
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
          getMessage(UNKNOWN_CLASS_IN_NS, "Button_TYPO", "sap.m")
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
          getMessage(
            UNKNOWN_TAG_NAME_IN_NS_UNDER_CLASS,
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
          getMessage(UNKNOWN_CLASS_IN_NS, "Button_TYPO", "sap.m")
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
          getMessage(UNKNOWN_CLASS_IN_NS, "content", "sap.m")
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
          getMessage(UNKNOWN_CLASS_IN_NS, "Button_TYPO", "sap.ui.core.mvc")
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
          getMessage(
            UNKNOWN_TAG_NAME_IN_NS_UNDER_CLASS,
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
          model: ui5SemanticModel,
          xmlText: xmlSnippet,
          validators: { element: [validateUnknownTagName] },
          assertion: (issues) => {
            expect(issues).to.deep.equalInAnyOrder([
              {
                kind: "UnknownTagName",
                message: getMessage(
                  UNKNOWN_CLASS_IN_NS,
                  "SplitApp_TYPO",
                  "sap.m"
                ),
                offsetRange: expectedRanges[0],
                severity: "error",
              },
              {
                kind: "UnknownTagName",
                message: getMessage(
                  UNKNOWN_TAG_NAME_IN_NS,
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
            getMessage(UNKNOWN_CLASS_WITHOUT_NS, "View")
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
            getMessage(UNKNOWN_CLASS_WITHOUT_NS, "List")
          );
        });

        it("will detect an invalid class or aggregation name under known class tag with default aggregation", () => {
          assertSingleIssue(
            `<mvc:View
              xmlns:mvc="sap.ui.core.mvc">
              <🢂List🢀></List>
            </mvc:View>`,
            getMessage(
              UNKNOWN_TAG_NAME_IN_CLASS,
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
            getMessage(
              UNKNOWN_AGGREGATION_IN_CLASS_DIFF_NAMESPACE,
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
            getMessage(UNKNOWN_TAG_NAME_NO_NS, "Button_TYPO")
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
            model: ui5SemanticModel,
            xmlText: xmlSnippet,
            validators: { element: [validateUnknownTagName] },
            assertion: (issues) => {
              expect(issues).to.deep.equalInAnyOrder([
                {
                  kind: "UnknownTagName",
                  message: getMessage(
                    UNKNOWN_TAG_NAME_IN_NS_UNDER_CLASS,
                    "SplitApp_TYPO",
                    "sap.m",
                    "sap.ui.core.mvc.View"
                  ),
                  offsetRange: expectedRanges[0],
                  severity: "error",
                },
                {
                  kind: "UnknownTagName",
                  message: getMessage(
                    UNKNOWN_TAG_NAME_IN_NS,
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
          getMessage(UNKNOWN_CLASS_IN_NS, "View_TYPO", "sap.ui.core.mvc")
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
          getMessage(UNKNOWN_CLASS_IN_NS, "List_TYPO", "sap.ui.core.mvc")
        );
      });

      it("will detect an invalid class or aggregation name under known class tag with default aggregation", () => {
        assertSingleIssue(
          `<View
            xmlns="sap.ui.core.mvc">
            <🢂List_TYPO🢀></List_TYPO>
          </View>`,
          getMessage(
            UNKNOWN_TAG_NAME_IN_NS_UNDER_CLASS,
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
          getMessage(
            UNKNOWN_AGGREGATION_IN_CLASS,
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
      assertNoIssues = partial(assertNoIssuesBase, ui5SemanticModel, {
        element: [validateUnknownTagName],
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
        it("will not detect an issue for known class in the root tag", () => {
          assertNoIssues(
            `<mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m">
            </mvc:View>`
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
