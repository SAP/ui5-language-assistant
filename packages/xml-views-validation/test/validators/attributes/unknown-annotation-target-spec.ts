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
import { validateUnknownAnnotationTarget } from "../../../src/validators/attributes/unknown-annotation-target";

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
  context("macros:Chart", () => {
    context("contextPath", () => {
      const content = `
          <mvc:View xmlns:core="sap.ui.core"
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m"
            xmlns:macros="sap.fe.macros">
          <Page>
            <content>
              <HBox >
                <items>
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
            attribute: [validateUnknownAnnotationTarget],
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
          attribute: [validateUnknownAnnotationTarget],
        });
      });

      it("will detect an empty contextPath", async () => {
        await assertSingleIssue(
          segments,
          useElement('<macros:Chart contextPath=🢂""🢀 />'),
          "AnnotationTargetRequired",
          "Annotation target is required"
        );
      });

      it("will detect wrong target path", async () => {
        await assertSingleIssue(
          segments,
          useElement('<macros:Chart contextPath="🢂/Unknown🢀" />'),
          "UnknownEnumValue",
          'Unknown annotation target: "/Unknown"'
        );
      });

      it("will detect wrong segment in target path", async () => {
        await assertSingleIssue(
          segments,
          useElement(
            '<macros:Chart contextPath="/Travel/to_Agency🢂/invalid🢀" />'
          ),
          "UnknownEnumValue",
          'Unknown annotation target: "/Travel/to_Agency/invalid"'
        );
      });

      it("will detect wrong following segment after collection valued segment in target path", async () => {
        await assertSingleIssue(
          segments,
          useElement(
            '<macros:Chart contextPath="/Travel🢂/to_Booking/invalid🢀" />'
          ),
          "UnknownEnumValue",
          "Any further segments after collection valued segment not allowed"
        );
      });

      it("will detect relative path", async () => {
        await assertSingleIssue(
          segments,
          useElement('<macros:Chart contextPath=🢂"to_Booking"🢀 />'),
          "UnknownEnumValue",
          'Unknown annotation target: "to_Booking"'
        );
      });

      it("will not complain when path differs from suggested options but is valid itself", async () => {
        await assertNoIssues(
          segments,
          useElement(
            '<macros:Field contextPath=🢂"/Booking/to_Travel/to_Agency/CountryCode"🢀 />'
          )
        );
      });

      it("will not complain when path is correct", async () => {
        await assertNoIssues(
          segments,
          useElement('<macros:Chart contextPath=🢂"/Travel/to_Booking"🢀 />')
        );
      });
    }).timeout(20000);
  });
});
