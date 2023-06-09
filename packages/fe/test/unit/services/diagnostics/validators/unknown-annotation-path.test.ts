import { join } from "path";
import { cache, Context } from "@ui5-language-assistant/context";
import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
} from "@ui5-language-assistant/test-framework";
import {
  getViewValidator,
  issueToSnapshot,
  prepareContextAdapter,
  ViewValidatorType,
} from "../../utils";
import { validateUnknownAnnotationPath } from "../../../../../src/services/diagnostics/validators/unknown-annotation-path";
import { initI18n } from "../../../../../src/api";

let framework: TestFramework;

describe("metaPath attribute value validation (annotation path)", () => {
  let root: string, documentPath: string;
  let validateView: ViewValidatorType;

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

  beforeAll(async function () {
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

    validateView = getViewValidator(
      framework,
      viewFilePathSegments,
      documentPath,
      validateUnknownAnnotationPath
    );

    const i18n = await framework.initI18n();
    initI18n(i18n);
  }, 5 * 60000);

  describe("shows no issues when metaPath...", () => {
    it("contains valid term", async function () {
      const result = await validateView(
        `<macros:Chart metaPath="@com.sap.vocabularies.UI.v1.Chart#sample1"></macros:Chart>`
      );
      expect(result.length).toEqual(0);
    });

    it("contains valid term with navigation segments", async function () {
      const result = await validateView(
        `<macros:Chart metaPath="to_Booking/to_Travel/@com.sap.vocabularies.UI.v1.Chart#sample1"></macros:Chart>`
      );
      expect(result.length).toEqual(0);
    });

    it("contextPath has trailing segment", async function () {
      const result = await validateView(
        `<macros:Chart contextPath="/Travel/" metaPath="@com.sap.vocabularies.UI.v1.Chart#sample1"></macros:Field>`
      );
      expect(result.length).toEqual(0);
    });

    it("attribute value is absent", async function () {
      const result = await validateView(
        `<macros:Chart metaPath></macros:Chart>`
      );
      expect(result.length).toEqual(0);
    });

    it("service path is not provided in manifest", async function () {
      const result = await validateView(
        `<macros:Chart metaPath=""></macros:Chart>`,
        (c) => ({
          ...c,
          manifestDetails: {
            ...c.manifestDetails,
            mainServicePath: "",
          },
        })
      );
      expect(result.length).toEqual(0);
    });

    it("custom views are empty manifest", async function () {
      const result = await validateView(
        `<macros:Chart metaPath=""></macros:Chart>`,
        (c) => {
          const newContext = {
            ...c,
            manifestDetails: { ...c.manifestDetails, customViews: {} },
          };
          return newContext;
        }
      );
      expect(result.length).toEqual(0);
    });

    it("custom view id not determined", async function () {
      const result = await validateView(
        `<macros:Chart metaPath=""></macros:Chart>`,
        (c) => {
          const newContext: Context = {
            ...c,
            customViewId: "",
          };
          return newContext;
        }
      );
      expect(result.length).toEqual(0);
    });

    it("contextPath is not absolute", async function () {
      const result = await validateView(
        `<macros:Chart contextPath="to_Booking" metaPath=""></macros:Chart>`
      );
      expect(result.length).toEqual(0);
    });

    it("existing contextPath target is not resolved", async function () {
      const result = await validateView(
        `<macros:Chart contextPath="/Travel1" metaPath=""></macros:Chart>`
      );
      expect(result.length).toEqual(0);
    });

    it("existing contextPath target is a property", async function () {
      const result = await validateView(
        `<macros:Chart contextPath="/Travel/BeginDate" metaPath=""></macros:Chart>`
      );
      expect(result.length).toEqual(0);
    });

    it("metaPath is not treated as annotation path", async function () {
      const result = await validateView(
        `<macros:Field metaPath="BeginDate"></macros:Field>`
      );
      expect(result.length).toEqual(0);
    });

    it("contains navigation segments when contextPath in manifest is specified", async function () {
      const result = await validateView(
        `<macros:Chart metaPath="to_Travel/@com.sap.vocabularies.UI.v1.Chart#sample1"></macros:Chart>`,
        prepareContextAdapter("/Booking")
      );
      expect(result.length).toEqual(0);
    });
  });

  describe("shows info message when...   ", () => {
    it("entity set in manifest can't be resolved", async function () {
      const result = await validateView(
        `<macros:Chart metaPath="@com.sap.vocabularies.UI.v1.Chart#sample1"></macros:Chart>`,
        (c) => {
          const newContext: Context = {
            ...c,
            manifestDetails: {
              ...c.manifestDetails,
              customViews: {
                ...c.manifestDetails.customViews,
              },
            },
          };
          const viewName =
            Object.keys(newContext.manifestDetails.customViews)[0] || "";
          newContext.manifestDetails.customViews[viewName] = {
            ...newContext.manifestDetails.customViews[viewName],
            entitySet: "Travel_",
          };
          return newContext;
        }
      );
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        'kind: InvalidAnnotationTarget; text: Entity Set "Travel_" specified in manifest for the current view is not found. Attribute value completion and diagnostics are disabled; severity:info; offset:344-386',
      ]);
    });
  });

  describe("shows warning when metaPath...", () => {
    it("is empty", async function () {
      const result = await validateView(
        `<macros:Chart metaPath=""></macros:Chart>`
      );
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        "kind: AnnotationPathRequired; text: Annotation path value cannot be empty; severity:warn; offset:344-345",
      ]);
    });

    it("contains wrong segments", async function () {
      const result = await validateView(
        `<macros:Chart metaPath="to_Booking_/to_Travel/@com.sap.vocabularies.UI.v1.Chart#sample1"></macros:Chart>`
      );
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        'kind: PathDoesNotExist; text: Unknown annotation path: "/Travel/to_Booking_/to_Travel/@com.sap.vocabularies.UI.v1.Chart#sample1"; severity:warn; offset:345-407',
      ]);
    });

    it("is absolute path", async function () {
      const result = await validateView(
        `<macros:Chart metaPath="/Booking/to_Travel/@com.sap.vocabularies.UI.v1.Chart#sample1"></macros:Chart>`
      );
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        "kind: InvalidAnnotationTerm; text: Absolute annotation paths not allowed in metaPath. Use contextPath attribute to change path context; severity:warn; offset:344-405",
      ]);
    });

    it("is incomplete", async function () {
      const result = await validateView(
        `<macros:Chart metaPath="to_Booking"></macros:Chart>`
      );
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        "kind: PropertyPathNotAllowed; text: Path value must end with annotation term. Use code completion to select annotation path; severity:warn; offset:344-355",
      ]);
    });

    it("is property path", async function () {
      const result = await validateView(
        `<macros:Chart metaPath="to_Booking/to_Travel/BeginDate"></macros:Chart>`
      );
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        "kind: PropertyPathNotAllowed; text: Path value must end with annotation term. Use code completion to select annotation path; severity:warn; offset:344-375",
      ]);
    });

    it("contains navigation segments when contextPath is specified", async function () {
      const result = await validateView(
        `<macros:Chart contextPath="/Booking" metaPath="to_Travel/@com.sap.vocabularies.UI.v1.Chart#sample1"></macros:Chart>`
      );
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        "kind: InvalidAnnotationTerm; text: Navigation segments not allowed when contextPath is provided; severity:warn; offset:367-419",
      ]);
    });

    it("is pointing to not existing term", async function () {
      const result = await validateView(
        `<macros:Chart metaPath="@com.sap.vocabularies.UI.v1.Chart"></macros:Chart>`
      );
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        'kind: PathDoesNotExist; text: Unknown annotation path: "/Travel/@com.sap.vocabularies.UI.v1.Chart"; severity:warn; offset:344-378',
      ]);
    });

    it("is pointing to not existing term (with contextPath)", async function () {
      const result = await validateView(
        `<macros:Chart contextPath="/Travel/" metaPath="@com.sap.vocabularies.UI.v1.Chart"></macros:Chart>`
      );
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        'kind: PathDoesNotExist; text: Unknown annotation path: "/Travel/@com.sap.vocabularies.UI.v1.Chart"; severity:warn; offset:367-401',
      ]);
    });

    it("does not exist", async function () {
      const result = await validateView(
        `<macros:Chart metaPath="to_Booking/to_Travel1/@com.sap.vocabularies.UI.v1.Chart"></macros:Chart>`
      );
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        'kind: PathDoesNotExist; text: Unknown annotation path: "/Travel/to_Booking/to_Travel1/@com.sap.vocabularies.UI.v1.Chart"; severity:warn; offset:355-399',
      ]);
    });

    it("itself is correct but pointing to invalid (not suitable for context) target", async function () {
      const result = await validateView(
        `<macros:Chart metaPath="@com.sap.vocabularies.UI.v1.LineItem"></macros:Chart>`
      );
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        'kind: InvalidAnnotationTerm; text: Invalid annotation term: "@com.sap.vocabularies.UI.v1.LineItem". Trigger code completion to choose one of allowed annotations; severity:warn; offset:344-381',
      ]);
    });

    it("itself is correct but pointing to invalid (not suitable for context) target (case 2)", async function () {
      const result = await validateView(
        `<macros:Chart metaPath="to_Booking/to_Travel/@com.sap.vocabularies.UI.v1.LineItem"></macros:Chart>`
      );
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        'kind: InvalidAnnotationTerm; text: Invalid annotation term: "to_Booking/to_Travel/@com.sap.vocabularies.UI.v1.LineItem". Trigger code completion to choose one of allowed annotations; severity:warn; offset:344-402',
      ]);
    });

    it("itself is correct but pointing to invalid (not suitable for context) target (case - valid term does not exist )", async function () {
      const result = await validateView(
        `<macros:FilterBar metaPath="@com.sap.vocabularies.UI.v1.LineItem"></macros:FilterBar>`
      );
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        'kind: InvalidAnnotationTerm; text: Invalid annotation term: "@com.sap.vocabularies.UI.v1.LineItem". There are no annotations in the project that are suitable for the current context; severity:warn; offset:348-385',
      ]);
    });
  });
});
