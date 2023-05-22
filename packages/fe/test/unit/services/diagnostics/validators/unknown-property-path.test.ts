import { join } from "path";
import {
  cache,
  ManifestDetails,
  Context,
} from "@ui5-language-assistant/context";
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
import { validateUnknownPropertyPath } from "../../../../../src/services/diagnostics/validators/unknown-property-path";
import { initI18n } from "../../../../../src/api";

let framework: TestFramework;

describe("metaPath attribute value validation (property path)", () => {
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
      validateUnknownPropertyPath
    );

    const i18n = await framework.initI18n();
    initI18n(i18n);
  }, 5 * 60000);

  describe("shows no issues when metaPath...", () => {
    it("contains valid property", async function () {
      const result = await validateView(
        `<macros:Field metaPath="TravelID"></macros:Field>`
      );
      expect(result.length).toEqual(0);
    });

    it("contains valid property path with navigation segments", async function () {
      const result = await validateView(
        `<macros:Field metaPath="to_Booking/BookingID"></macros:Field>`
      );
      expect(result.length).toEqual(0);
    });

    it("contains valid property path and contextPath with trailing slash", async function () {
      const result = await validateView(
        `<macros:Field contextPath="/Booking/" metaPath="BookingID"></macros:Field>`
      );
      expect(result.length).toEqual(0);
    });

    it("contains valid absolute property path", async function () {
      const result = await validateView(
        `<macros:Field metaPath="/Travel/BeginDate"></macros:Field>`
      );
      expect(result.length).toEqual(0);
    });

    it("contains valid absolute property path with navigation segments", async function () {
      const result = await validateView(
        `<macros:Field metaPath="/Travel/to_Booking/BookingID"></macros:Field>`
      );
      expect(result.length).toEqual(0);
    });

    it("is annotation path", async function () {
      const result = await validateView(
        `<macros:Chart metaPath="@com.sap.vocabularies.UI.v1.Chart#sample1"></macros:Chart>`
      );
      expect(result.length).toEqual(0);
    });

    it("is invalid and contextPath is invalid", async function () {
      const result = await validateView(
        `<macros:Chart contextPath="to_Booking" metaPath="BookingID1"></macros:Chart>`
      );
      expect(result.length).toEqual(0);
    });

    it("is invalid and contextPath can not be resolved", async function () {
      const result = await validateView(
        `<macros:Field contextPath="/Travel1" metaPath="BookingID1"></macros:Field>`
      );
      expect(result.length).toEqual(0);
    });

    it("is invalid and contextPath can not be resolved (case 2 for coverage)", async function () {
      const result = await validateView(
        `<macros:Field contextPath="/Travel/to_Booking/to_BookSupplement_" metaPath="BookingID1"></macros:Field>`
      );
      expect(result.length).toEqual(0);
    });

    it("attribute value is absent", async function () {
      const result = await validateView(
        `<macros:Field metaPath></macros:Field>`
      );
      expect(result.length).toEqual(0);
    });

    it("contains navigation segments when contextPath is specified in manifest", async function () {
      const result = await validateView(
        `<macros:Field  metaPath="to_Travel/TravelID"></macros:Field>`,
        prepareContextAdapter("/Booking")
      );
      expect(result.length).toEqual(0);
    });
  });

  describe("does not show any warnings when...", () => {
    it("service path is not provided in manifest", async function () {
      const result = await validateView(
        `<macros:Field metaPath=""></macros:Field>`,
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

    it("wrong entitySet specified in manifest", async function () {
      const result = await validateView(
        `<macros:Field metaPath=""></macros:Field>`,
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
      expect(result.length).toEqual(0);
    });

    it("custom view id not determined", async function () {
      const result = await validateView(
        `<macros:Field metaPath=""></macros:Chart>`,
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
  });

  describe("shows warning when metaPath...", () => {
    it("is empty", async function () {
      const result = await validateView(
        `<macros:Field metaPath=""></macros:Field>`
      );
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        "kind: PropertyPathRequired; text: Property path value cannot be empty; severity:warn; offset:344-345",
      ]);
    });

    it("contains navigation segments when contextPath is specified", async function () {
      const result = await validateView(
        `<macros:Field contextPath="/Booking" metaPath="to_Travel/TravelID"></macros:Field>`
      );
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        "kind: InvalidAnnotationTerm; text: Navigation segments not allowed when contextPath is provided; severity:warn; offset:367-386",
      ]);
    });

    it("is pointing to not existing property", async function () {
      const result = await validateView(
        `<macros:Field metaPath="testProperty"></macros:Field>`
      );
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        'kind: UnknownPropertyPath; text: Unknown path: "/Travel/testProperty"; severity:warn; offset:345-356',
      ]);
    });

    it("is pointing to not existing property (with context path)", async function () {
      const result = await validateView(
        `<macros:Field contextPath="/Travel/" metaPath="testProperty"></macros:Field>`
      );
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        'kind: UnknownPropertyPath; text: Unknown path: "/Travel/testProperty"; severity:warn; offset:368-379',
      ]);
    });

    it("contains incomplete absolute property path", async function () {
      const result = await validateView(
        `<macros:Field metaPath="/Travel"></macros:Field>`
      );
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        "kind: PropertyPathRequired; text: Invalid path value. The path leads to Edm.EntityType, but expected type is Edm.Property; severity:warn; offset:344-352",
      ]);
    });

    it("contains incomplete absolute property path (case 2)", async function () {
      const result = await validateView(
        `<macros:Field metaPath="/TravelService.EntityContainer/"></macros:Field>`
      );
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        "kind: IncompletePath; text: Invalid path value. The path leads to Edm.EntityContainer, but expected type is Edm.Property; severity:warn; offset:344-376",
      ]);
    });

    it("contains incomplete absolute property path (case 3)", async function () {
      const result = await validateView(
        `<macros:Field metaPath="/TravelService.EntityContainer/Travel/to_Booking"></macros:Field>`
      );
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        "kind: PropertyPathRequired; text: Invalid path value. The path leads to Edm.EntityType, but expected type is Edm.Property; severity:warn; offset:344-393",
      ]);
    });

    it("contains invalid absolute path first segment", async function () {
      const result = await validateView(
        `<macros:Field metaPath="/Travel_"></macros:Field>`
      );
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        'kind: UnknownPropertyPath; text: Unknown path: "/Travel_"; severity:warn; offset:345-352',
      ]);
    });

    it("contains absolute path with invalid navigation segment", async function () {
      const result = await validateView(
        `<macros:Field metaPath="/Travel/to_Booking_/BookingDate"></macros:Field>`
      );
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        'kind: UnknownPropertyPath; text: Unknown path: "/Travel/to_Booking_/BookingDate"; severity:warn; offset:353-375',
      ]);
    });

    it("contains absolute path with invalid cardinality navigation segment", async function () {
      const result = await validateView(
        `<macros:Field metaPath="/Travel/to_Booking/to_BookSupplement/BookingSupplementID"></macros:Field>`
      );
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        "kind: UnknownPropertyPath; text: Invalid property path value. Multiple 1:many association segments not allowed; severity:warn; offset:363-400",
      ]);
    });

    it("does not exist", async function () {
      const result = await validateView(
        `<macros:Field metaPath="to_Booking/to_Travel1/TravelID"></macros:Field>`
      );
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        'kind: UnknownPropertyPath; text: Unknown path: "/Travel/to_Booking/to_Travel1/TravelID"; severity:warn; offset:356-374',
      ]);
    });

    it("is incomplete", async function () {
      const result = await validateView(
        `<macros:Field metaPath="to_Booking"></macros:Chart>`
      );
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        "kind: PropertyPathRequired; text: Invalid path value. The path leads to Edm.EntityType, but expected type is Edm.Property; severity:warn; offset:344-355",
      ]);
    });
  });
});
