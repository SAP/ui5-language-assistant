import { expect } from "chai";
import { join } from "path";
import {
  getContext,
  cache,
  ManifestDetails,
  Context,
} from "@ui5-language-assistant/context";
import { CURSOR_ANCHOR } from "@ui5-language-assistant/test-framework";
import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
} from "@ui5-language-assistant/test-framework";

import { AnnotationIssue } from "../../../../src/api";
import { validateXMLView } from "@ui5-language-assistant/xml-views-validation";
import { issueToSnapshot } from "../../utils";
import { validateUnknownPropertyPath } from "../../../../src/services/diagnostics/validators/unknown-property-path";

let framework: TestFramework;

describe("metaPath attribute value validation (property path)", () => {
  let root: string, documentPath: string;

  const viewFilePathSegments = [
    "app",
    "manage_travels",
    "webapp",
    "ext",
    "main",
    "Main.view.xml",
  ];
  const annoFileSegmentsCDS = ["app", "manage_travels", "annotations.cds"];

  const annotationSnippetCDS = `
      annotate service.Travel with @(
          UI.Chart #sample1 :{
              ChartType: #Bar
          },
          UI.LineItem : [],
      );
    `;

  before(async function () {
    const timeout = 5 * 60000 + 8000; // 5 min for initial npm install + 8 sec
    this.timeout(timeout);

    const config: Config = {
      projectInfo: {
        name: ProjectName.cap,
        type: ProjectType.CAP,
        npmInstall: true,
        deleteBeforeCopy: false,
      },
    };
    framework = new TestFramework(config);

    root = framework.getProjectRoot();
    documentPath = join(
      root,
      "app",
      "manage_travels",
      "webapp",
      "ext",
      "main",
      "Main.view.xml"
    );

    await framework.updateFileContent(
      annoFileSegmentsCDS,
      annotationSnippetCDS
    );
    cache.reset(); // to refresh context
  });

  const validateView = async (
    snippet: string,
    that: { timeout: (t: number) => void },
    contextAdapter?: (context: Context) => Context
  ): Promise<AnnotationIssue[]> => {
    const timeout = 60000;
    that.timeout(timeout);
    let result: AnnotationIssue[] = [];
    try {
      await framework.updateFileContent(viewFilePathSegments, snippet, {
        insertAfter: "<content>",
      });
      const { ast } = await framework.readFile(viewFilePathSegments);
      const context = await getContext(documentPath);
      result = validateXMLView({
        validators: {
          attribute: [validateUnknownPropertyPath],
          document: [],
          element: [],
        },
        context: contextAdapter ? contextAdapter(context) : context,
        xmlView: ast,
      }) as AnnotationIssue[];
    } finally {
      // reversal update
      await framework.updateFileContent(viewFilePathSegments, "", {
        doUpdatesAfter: "<content>",
        replaceText: snippet.replace(CURSOR_ANCHOR, ""),
      });
    }
    return result;
  };

  context("shows no issues when metaPath...", () => {
    it("contains valid property", async function () {
      const result = await validateView(
        `<macros:Field metaPath="TravelID"></macros:Field>`,
        this
      );
      expect(result.length).to.eq(0);
    });

    it("contains valid property path with navigation segments", async function () {
      const result = await validateView(
        `<macros:Field metaPath="to_Booking/BookingID"></macros:Field>`,
        this
      );
      expect(result.length).to.eq(0);
    });

    it("contains valid property path and contextPath with trailing slash", async function () {
      const result = await validateView(
        `<macros:Field contextPath="/Booking/" metaPath="BookingID"></macros:Field>`,
        this
      );
      expect(result.length).to.eq(0);
    });

    it("contains valid absolute property path", async function () {
      const result = await validateView(
        `<macros:Field metaPath="/Travel/BeginDate"></macros:Field>`,
        this
      );
      expect(result.length).to.eq(0);
    });

    it("contains valid absolute property path with navigation segments", async function () {
      const result = await validateView(
        `<macros:Field metaPath="/Travel/to_Booking/BookingID"></macros:Field>`,
        this
      );
      expect(result.length).to.eq(0);
    });

    it("is annotation path", async function () {
      const result = await validateView(
        `<macros:Chart metaPath="@com.sap.vocabularies.UI.v1.Chart#sample1"></macros:Chart>`,
        this
      );
      expect(result.length).to.eq(0);
    });

    it("is invalid and contextPath is invalid", async function () {
      const result = await validateView(
        `<macros:Chart contextPath="to_Booking" metaPath="BookingID1"></macros:Chart>`,
        this
      );
      expect(result.length).to.eq(0);
    });

    it("is invalid and contextPath can not be resolved", async function () {
      const result = await validateView(
        `<macros:Field contextPath="/Travel1" metaPath="BookingID1"></macros:Field>`,
        this
      );
      expect(result.length).to.eq(0);
    });

    it("is invalid and contextPath can not be resolved (case 2 for coverage)", async function () {
      const result = await validateView(
        `<macros:Field contextPath="/Travel/to_Booking/to_BookSupplement_" metaPath="BookingID1"></macros:Field>`,
        this
      );
      expect(result.length).to.eq(0);
    });

    it("attribute value is absent", async function () {
      const result = await validateView(
        `<macros:Field metaPath></macros:Field>`,
        this
      );
      expect(result.length).to.eq(0);
    });
  });

  context("does not show any warnings when...", () => {
    it("service details are missing in manifest", async function () {
      const result = await validateView(
        `<macros:Field metaPath=""></macros:Field>`,
        this,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (c) => ({ ...c, manifestDetails: undefined } as any)
      );
      expect(result.length).to.eq(0);
    });

    it("service path is not provided in manifest", async function () {
      const result = await validateView(
        `<macros:Field metaPath=""></macros:Field>`,
        this,
        (c) => ({
          ...c,
          manifestDetails: {
            ...c.manifestDetails,
            mainServicePath: "",
          },
        })
      );
      expect(result.length).to.eq(0);
    });

    it("custom views are missing in manifest", async function () {
      const result = await validateView(
        `<macros:Field metaPath=""></macros:Field>`,
        this,
        (c) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const newDetails: any = { ...c.manifestDetails };
          delete newDetails["customViews"];
          const newContext = {
            ...c,
            manifestDetails: newDetails,
          };
          return newContext;
        }
      );
      expect(result.length).to.eq(0);
    });

    it("wrong entitySet specified in manifestt", async function () {
      const result = await validateView(
        `<macros:Field metaPath=""></macros:Field>`,
        this,
        (c) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const newDetails: ManifestDetails = {
            ...c.manifestDetails,
            customViews: { ...c.manifestDetails.customViews },
          };
          Object.keys(newDetails.customViews).forEach((key) => {
            newDetails.customViews[key] = {
              ...newDetails.customViews[key],
              entitySet: "Travel_",
            };
          });
          const newContext = {
            ...c,
            manifestDetails: newDetails,
          };
          return newContext;
        }
      );
      expect(result.length).to.eq(0);
    });

    it("custom view id not determined", async function () {
      const result = await validateView(
        `<macros:Field metaPath=""></macros:Chart>`,
        this,
        (c) => {
          const newContext: Context = {
            ...c,
            customViewId: "",
          };
          return newContext;
        }
      );
      expect(result.length).to.eq(0);
    });
  });

  context("shows warning when metaPath...", () => {
    it("is empty", async function () {
      const result = await validateView(
        `<macros:Field metaPath=""></macros:Field>`,
        this
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        "kind: PropertyPathRequired; text: Property path is required; severity:warn; offset:344-345",
      ]);
    });

    it("contains navigation segments when contextPath is specified", async function () {
      const result = await validateView(
        `<macros:Field contextPath="/Booking" metaPath="to_Travel/TravelID"></macros:Field>`,
        this
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        "kind: InvalidAnnotationTerm; text: Navigation segments not allowed when contextPath is provided; severity:warn; offset:367-386",
      ]);
    });

    it("is pointing to not existing property", async function () {
      const result = await validateView(
        `<macros:Field metaPath="testProperty"></macros:Field>`,
        this
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        'kind: PathDoesNotExist; text: Path does not exist: "/Travel/testProperty"; severity:warn; offset:345-356',
      ]);
    });

    it("is pointing to not existing property (with context path)", async function () {
      const result = await validateView(
        `<macros:Field contextPath="/Travel/" metaPath="testProperty"></macros:Field>`,
        this
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        'kind: PathDoesNotExist; text: Path does not exist: "/Travel/testProperty"; severity:warn; offset:368-379',
      ]);
    });

    it("contains incomplete absolute property path", async function () {
      const result = await validateView(
        `<macros:Field metaPath="/Travel"></macros:Field>`,
        this
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        'kind: UnknownPropertyPath; text: Path should lead to property: "/Travel"; severity:warn; offset:344-352',
      ]);
    });

    it("contains invalid absolute path first segment", async function () {
      const result = await validateView(
        `<macros:Field metaPath="/Travel_"></macros:Field>`,
        this
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        'kind: PathDoesNotExist; text: Path does not exist: "/Travel_"; severity:warn; offset:344-353',
      ]);
    });

    it("contains absolute path with invalid navigation segment", async function () {
      const result = await validateView(
        `<macros:Field metaPath="/Travel/to_Booking_/BookingDate"></macros:Field>`,
        this
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        'kind: PathDoesNotExist; text: Path does not exist: "/Travel/to_Booking_/BookingDate"; severity:warn; offset:352-375',
      ]);
    });

    it("does not exist", async function () {
      const result = await validateView(
        `<macros:Field metaPath="to_Booking/to_Travel1/TravelID"></macros:Field>`,
        this
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        'kind: PathDoesNotExist; text: Path does not exist: "/Travel/to_Booking/to_Travel1/TravelID"; severity:warn; offset:355-374',
      ]);
    });

    it("is incomplete", async function () {
      const result = await validateView(
        `<macros:Field metaPath="to_Booking"></macros:Chart>`,
        this
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        'kind: UnknownPropertyPath; text: Path should lead to property: "to_Booking"; severity:warn; offset:344-355',
      ]);
    });
  });
});
