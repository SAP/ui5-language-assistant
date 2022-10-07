import {
  Config,
  ProjectName,
  ProjectType,
  TestUtils,
} from "@ui5-language-assistant/test-utils";
import { partial } from "lodash";
import {
  assertSingleAnnotationIssue as assertSingleIssueBase,
  assertNoAnnotationIssues,
} from "../../test-utils";
import { validateFilterBarId } from "../../../src/validators/attributes/wrong-filter-bar-id";

describe("The ui5-language-assistant xml-views-validation", () => {
  let testUtils: TestUtils;
  const segments = [
    "app",
    "manage_travels",
    "webapp",
    "ext",
    "main",
    "Main.view.xml",
  ];
  before(function () {
    const timeout = 5 * 60000 + 8000; // 5 min for initial npm install + 8 sec
    this.timeout(timeout);
    const config: Config = {
      projectInfo: {
        name: ProjectName.cap,
        type: ProjectType.cap,
        npmInstall: true,
      },
    };
    testUtils = new TestUtils(config);
  });
  context("macros:Table", () => {
    context("filterBar", () => {
      const content = `
          <mvc:View xmlns:core="sap.ui.core"
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m"
            xmlns:macros="sap.fe.macros">
          <Page>
            <content>
              <HBox >
                <items>
                  <macros:FilterBar id="FilterBar1" />
                    ⇶
                </items>
              </HBox>
            </content>
          </Page>
          </mvc:View>
          `;
      const useElement = (elementSnippet: string) =>
        content.replace("⇶", elementSnippet);

      let assertSingleIssue: (
        segments: string[],
        xmlSnippet: string,
        kind: string,
        message: string
      ) => Promise<void>;
      before(() => {
        assertSingleIssue = partial(
          assertSingleIssueBase,
          testUtils,
          {
            attribute: [validateFilterBarId],
          },
          "warn"
        );
      });

      let assertNoIssues: (
        segments: string[],
        xmlSnippet: string
      ) => Promise<void>;
      before(() => {
        assertNoIssues = partial(assertNoAnnotationIssues, testUtils, {
          attribute: [validateFilterBarId],
        });
      });

      it("will detect empty filterBar id", async () => {
        await assertSingleIssue(
          segments,
          useElement('<macros:Table filterBar=🢂""🢀 />'),
          "UnknownEnumValue",
          "Trigger code completion to choose one of existing FilterBar ids"
        );
      });

      it("will detect wrong filterBar id", async () => {
        await assertSingleIssue(
          segments,
          useElement('<macros:Table filterBar=🢂"FilterBar"🢀 />'),
          "UnknownEnumValue",
          'FilterBar with id "FilterBar" does not exist. Trigger code completion to choose one of existing FilterBar ids'
        );
      });

      it("will not complain when id is correct", async () => {
        await assertNoIssues(
          segments,
          useElement('<macros:Table filterBar=🢂"FilterBar1"🢀 />')
        );
      });
    }).timeout(20000);
  });
});
