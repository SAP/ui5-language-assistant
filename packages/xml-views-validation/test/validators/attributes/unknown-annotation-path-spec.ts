import {
  Config,
  ProjectName,
  ProjectType,
  TestUtils,
} from "@ui5-language-assistant/test-utils";
import { partial, replace } from "lodash";
import {
  assertSingleAnnotationIssue as assertSingleIssueBase,
  assertNoAnnotationIssues,
} from "../../test-utils";
import { validateUnknownAnnotationPath } from "../../../src/validators/attributes/unknown-annotation-path";
import { validateUnknownPropertyPath } from "../../../src/validators/attributes/unknown-property-path";

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
    context("metaPath", () => {
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
            attribute: [validateUnknownAnnotationPath],
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
          attribute: [validateUnknownAnnotationPath],
        });
      });

      context("no contextPath provided", function () {
        it("will detect an empty metaPath", async () => {
          await assertSingleIssue(
            segments,
            useElement('<macros:Chart metaPath=🢂""🢀 />'),
            "AnnotationPathRequired",
            "Annotation path is required"
          );
        }).timeout(20000);

        it("will detect not suitable term and suitable ones exist in the project", async () => {
          await assertSingleIssue(
            segments,
            useElement(
              '<macros:Chart metaPath=🢂"@com.sap.vocabularies.UI.v1.LineItem"🢀 />'
            ),
            "InvalidAnnotationTerm",
            'Invalid annotation term: "@com.sap.vocabularies.UI.v1.LineItem". Trigger code completion to choose one of allowed annotations'
          );
        });

        // Update of project file is needed - chart annotation deletion
        it.skip("will detect not suitable term and there are no suitable ones in the project", async () => {
          await assertSingleIssue(
            segments,
            useElement(
              '<macros:Chart metaPath=🢂"@com.sap.vocabularies.UI.v1.LineItem"🢀 />'
            ),
            "InvalidAnnotationTerm",
            'Invalid annotation term: "@com.sap.vocabularies.UI.v1.LineItem". Trigger code completion to choose one of allowed annotations'
          );
        });

        it("will detect wrong term", async () => {
          await assertSingleIssue(
            segments,
            useElement(
              '<macros:Chart metaPath=🢂"@com.sap.vocabularies.UI.v1.LineItem1"🢀 />'
            ),
            "PathDoesNotExist",
            'Path does not exist: "/Travel/@com.sap.vocabularies.UI.v1.LineItem1"'
          );
        });

        it("will detect property path instead of annotation path", async () => {
          await assertSingleIssue(
            segments,
            useElement('<macros:Chart metaPath=🢂"to_Booking"🢀 />'),
            "PropertyPathNotAllowed",
            "Property path not allowed. Use code completion to select annotation path"
          );
        });

        it("will detect wrong segment in relative annotation path", async () => {
          await assertSingleIssue(
            segments,
            useElement(
              '<macros:Chart metaPath="to_Booking🢂/invalid/@com.sap.vocabularies.UI.v1.Chart🢀" />'
            ),
            "PathDoesNotExist",
            'Path does not exist: "/Travel/to_Booking/invalid/@com.sap.vocabularies.UI.v1.Chart"'
          );
        });

        it("will detect not allowed absolute annotation path", async () => {
          await assertSingleIssue(
            segments,
            useElement(
              '<macros:Chart metaPath=🢂"/Travel/to_Booking/@com.sap.vocabularies.UI.v1.Chart#booking"🢀 />'
            ),
            "InvalidAnnotationTerm",
            "Absolute annotation paths not allowed in metaPath. Use contextPath attribute to change path context"
          );
        });

        it("will not complain when path differs from suggested options but leads to correct annotation", async () => {
          await assertNoIssues(
            segments,
            useElement(
              '<macros:Chart metaPath=🢂"to_Booking/to_BookSupplement/to_Travel/to_Booking/@com.sap.vocabularies.UI.v1.Chart#BookedFlights"🢀 />'
            )
          );
        });

        it("will not complain when path is correct", async () => {
          await assertNoIssues(
            segments,
            useElement(
              '<macros:Chart metaPath=🢂"to_Booking/@com.sap.vocabularies.UI.v1.Chart#BookedFlights"🢀 />'
            )
          );
        });
      }).timeout(20000);

      context("contextPath is provided", () => {
        it("will detect unnecessary navigation segments in metaPath", async () => {
          await assertSingleIssue(
            segments,
            useElement(
              '<macros:Chart metaPath=🢂"to_Travel/@com.sap.vocabularies.UI.v1.LineItem"🢀 contextPath="/Booking" />'
            ),
            "InvalidAnnotationTerm",
            "Navigation segments not allowed when contextPath is provided"
          );
        });

        it("will detect non existing term", async () => {
          await assertSingleIssue(
            segments,
            useElement(
              '<macros:Chart metaPath=🢂"@com.sap.vocabularies.UI.v1.LineItem#unknown"🢀 contextPath="/Travel" />'
            ),
            "PathDoesNotExist",
            'Path does not exist: "/Travel/@com.sap.vocabularies.UI.v1.LineItem#unknown"'
          );
        });

        it("will not complain when path is correct", async () => {
          await assertNoIssues(
            segments,
            useElement(
              '<macros:Chart metaPath=🢂"@com.sap.vocabularies.UI.v1.Chart#BookedFlights"🢀 contextPath="/Travel/to_Booking"/>'
            )
          );
        });
      }).timeout(20000);
    });
  });
  context("macros:Field", () => {
    context("metaPath", () => {
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
            attribute: [validateUnknownPropertyPath],
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
          attribute: [validateUnknownPropertyPath],
        });
      });

      context("no contextPath provided", function () {
        it("will detect wrong property", async () => {
          await assertSingleIssue(
            segments,
            useElement('<macros:Field metaPath="🢂unknown🢀" />'),
            "PathDoesNotExist",
            'Path does not exist: "/Travel/unknown"'
          );
        });

        it("will detect wrong segment in relative property path", async () => {
          await assertSingleIssue(
            segments,
            useElement('<macros:Field metaPath="to_Booking🢂/invalid🢀" />'),
            "PathDoesNotExist",
            'Path does not exist: "/Travel/to_Booking/invalid"'
          );
        });

        it("will not complain when path differs from suggested options but leads to correct property", async () => {
          await assertNoIssues(
            segments,
            useElement(
              '<macros:Field metaPath=🢂"to_Booking/to_BookSupplement/to_Travel/to_Booking/BookingDate"🢀 />'
            )
          );
        });

        it("will not complain when path is absolute", async () => {
          await assertNoIssues(
            segments,
            useElement(
              '<macros:Field metaPath=🢂"/Travel/to_Booking/BookingDate"🢀 />'
            )
          );
        });

        it("will not complain an issue when path is correct", async () => {
          await assertNoIssues(
            segments,
            useElement('<macros:Field metaPath=🢂"to_Booking/BookingDate"🢀 />')
          );
        });
      }).timeout(20000);

      context("contextPath is provided", () => {
        it("will detect unnecessary navigation segments in metaPath", async () => {
          await assertSingleIssue(
            segments,
            useElement(
              '<macros:Field metaPath=🢂"to_Travel/TravelID"🢀 contextPath="/Booking" />'
            ),
            "InvalidAnnotationTerm",
            "Navigation segments not allowed when contextPath is provided"
          );
        });

        it("will detect non existing property", async () => {
          await assertSingleIssue(
            segments,
            useElement(
              '<macros:Field metaPath="🢂unknown🢀" contextPath="/Travel" />'
            ),
            "PathDoesNotExist",
            'Path does not exist: "/Travel/unknown"'
          );
        });

        it("will not complain when path is correct", async () => {
          await assertNoIssues(
            segments,
            useElement(
              '<macros:Field metaPath=🢂"BookingDate"🢀 contextPath="/Travel/to_Booking"/>'
            )
          );
        });
      }).timeout(20000);
    });
  });
});
