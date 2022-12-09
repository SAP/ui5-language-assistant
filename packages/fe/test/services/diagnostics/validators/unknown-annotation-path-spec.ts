import { expect } from "chai";
import { join } from "path";
import {
  getContext,
  cache,
  Context,
  ManifestDetails,
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
import { validateUnknownAnnotationPath } from "../../../../src/services/diagnostics/validators/unknown-annotation-path";

let framework: TestFramework;

describe("metaPath attribute value validation (annotation path)", () => {
  let root: string, uri: string, documentPath: string;

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
    uri = framework.getFileUri([root, ...viewFilePathSegments]);
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
          attribute: [validateUnknownAnnotationPath],
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
    it("contains valid term", async function () {
      const result = await validateView(
        `<macros:Chart metaPath="@com.sap.vocabularies.UI.v1.Chart#sample1"></macros:Chart>`,
        this
      );
      expect(result.length).to.eq(0);
    });

    it("contains valid term with navigation segments", async function () {
      const result = await validateView(
        `<macros:Chart metaPath="to_Booking/to_Travel/@com.sap.vocabularies.UI.v1.Chart#sample1"></macros:Chart>`,
        this
      );
      expect(result.length).to.eq(0);
    });

    it("attribute value is absent", async function () {
      const result = await validateView(
        `<macros:Chart metaPath></macros:Chart>`,
        this
      );
      expect(result.length).to.eq(0);
    });

    it("service details are missing in manifest", async function () {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await validateView(
        `<macros:Chart metaPath=""></macros:Chart>`,
        this,
        (c) => ({ ...c, manifestDetails: undefined } as any)
      );
      expect(result.length).to.eq(0);
    });

    it("service path is not provided in manifest", async function () {
      const result = await validateView(
        `<macros:Chart metaPath=""></macros:Chart>`,
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
        `<macros:Chart metaPath=""></macros:Chart>`,
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

    it("custom views are empty manifest", async function () {
      const result = await validateView(
        `<macros:Chart metaPath=""></macros:Chart>`,
        this,
        (c) => {
          const newContext = {
            ...c,
            manifestDetails: { ...c.manifestDetails, customViews: {} },
          };
          return newContext;
        }
      );
      expect(result.length).to.eq(0);
    });

    it("wrong entitySet specified in manifestt", async function () {
      const result = await validateView(
        `<macros:Chart metaPath=""></macros:Chart>`,
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
        `<macros:Chart metaPath=""></macros:Chart>`,
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

    it("contextPath is not absolute", async function () {
      const result = await validateView(
        `<macros:Chart contextPath="to_Booking" metaPath=""></macros:Chart>`,
        this
      );
      expect(result.length).to.eq(0);
    });

    it("existing contextPath target is not resolved", async function () {
      const result = await validateView(
        `<macros:Chart contextPath="/Travel1" metaPath=""></macros:Chart>`,
        this
      );
      expect(result.length).to.eq(0);
    });

    it("existing contextPath target is a property", async function () {
      const result = await validateView(
        `<macros:Chart contextPath="/Travel/BeginDate" metaPath=""></macros:Chart>`,
        this
      );
      expect(result.length).to.eq(0);
    });

    it("metaPath is not treated as annotation path", async function () {
      const result = await validateView(
        `<macros:Field metaPath="BeginDate"></macros:Field>`,
        this
      );
      expect(result.length).to.eq(0);
    });
  });

  context("shows warning when metaPath...", () => {
    it("is empty", async function () {
      const result = await validateView(
        `<macros:Chart metaPath=""></macros:Chart>`,
        this
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        "kind: AnnotationPathRequired; text: Annotation path is required; severity:warn; offset:344-345",
      ]);
    });

    it("contains wrong segments", async function () {
      const result = await validateView(
        `<macros:Chart metaPath="to_Booking_/to_Travel/@com.sap.vocabularies.UI.v1.Chart#sample1"></macros:Chart>`,
        this
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        'kind: PathDoesNotExist; text: Path does not exist: "/Travel/to_Booking_/to_Travel/@com.sap.vocabularies.UI.v1.Chart#sample1"; severity:warn; offset:345-407',
      ]);
    });

    it("is absolute path", async function () {
      const result = await validateView(
        `<macros:Chart metaPath="/Booking/to_Travel/@com.sap.vocabularies.UI.v1.Chart#sample1"></macros:Chart>`,
        this
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        "kind: InvalidAnnotationTerm; text: Absolute annotation paths not allowed in metaPath. Use contextPath attribute to change path context; severity:warn; offset:344-405",
      ]);
    });

    it("is incomplete", async function () {
      const result = await validateView(
        `<macros:Chart metaPath="to_Booking"></macros:Chart>`,
        this
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        "kind: PropertyPathNotAllowed; text: Property path not allowed. Use code completion to select annotation path; severity:warn; offset:344-355",
      ]);
    });

    it("is property path", async function () {
      const result = await validateView(
        `<macros:Chart metaPath="to_Booking/to_Travel/BeginDate"></macros:Chart>`,
        this
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        "kind: PropertyPathNotAllowed; text: Property path not allowed. Use code completion to select annotation path; severity:warn; offset:344-375",
      ]);
    });

    it("contains navigation segments when contextPath is specified", async function () {
      const result = await validateView(
        `<macros:Chart contextPath="/Booking" metaPath="to_Travel/@com.sap.vocabularies.UI.v1.Chart#sample1"></macros:Chart>`,
        this
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        "kind: InvalidAnnotationTerm; text: Navigation segments not allowed when contextPath is provided; severity:warn; offset:367-419",
      ]);
    });

    it("is pointing to not existing term", async function () {
      const result = await validateView(
        `<macros:Chart metaPath="@com.sap.vocabularies.UI.v1.Chart"></macros:Chart>`,
        this
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        'kind: PathDoesNotExist; text: Path does not exist: "/Travel/@com.sap.vocabularies.UI.v1.Chart"; severity:warn; offset:344-378',
      ]);
    });

    it("does not exist", async function () {
      const result = await validateView(
        `<macros:Chart metaPath="to_Booking/to_Travel1/@com.sap.vocabularies.UI.v1.Chart"></macros:Chart>`,
        this
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        'kind: PathDoesNotExist; text: Path does not exist: "/Travel/to_Booking/to_Travel1/@com.sap.vocabularies.UI.v1.Chart"; severity:warn; offset:355-399',
      ]);
    });

    it("does not exist", async function () {
      const result = await validateView(
        `<macros:Chart metaPath="to_Booking/to_Travel1/@com.sap.vocabularies.UI.v1.Chart"></macros:Chart>`,
        this
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        'kind: PathDoesNotExist; text: Path does not exist: "/Travel/to_Booking/to_Travel1/@com.sap.vocabularies.UI.v1.Chart"; severity:warn; offset:355-399',
      ]);
    });

    it("itself is correct but pointing to invalid (not suitable for context) target", async function () {
      const result = await validateView(
        `<macros:Chart metaPath="@com.sap.vocabularies.UI.v1.LineItem"></macros:Chart>`,
        this
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        'kind: InvalidAnnotationTerm; text: Invalid annotation term: "@com.sap.vocabularies.UI.v1.LineItem". Trigger code completion to choose one of allowed annotations; severity:warn; offset:344-381',
      ]);
    });

    it("itself is correct but pointing to invalid (not suitable for context) target (case 2)", async function () {
      const result = await validateView(
        `<macros:Chart metaPath="to_Booking/to_Travel/@com.sap.vocabularies.UI.v1.LineItem"></macros:Chart>`,
        this
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        'kind: InvalidAnnotationTerm; text: Invalid annotation term: "to_Booking/to_Travel/@com.sap.vocabularies.UI.v1.LineItem". Trigger code completion to choose one of allowed annotations; severity:warn; offset:344-402',
      ]);
    });

    it("itself is correct but pointing to invalid (not suitable for context) target (case - valid term does not exist )", async function () {
      const result = await validateView(
        `<macros:FilterBar metaPath="@com.sap.vocabularies.UI.v1.LineItem"></macros:FilterBar>`,
        this
      );
      expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
        'kind: InvalidAnnotationTerm; text: Invalid annotation term: "@com.sap.vocabularies.UI.v1.LineItem". There are no annotations in the project that are suitable for the current context; severity:warn; offset:348-385',
      ]);
    });
  });
});
