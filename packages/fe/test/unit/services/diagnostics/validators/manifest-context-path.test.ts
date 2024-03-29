import { join } from "path";
import { cache } from "@ui5-language-assistant/context";
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
import { initI18n } from "../../../../../src/api";
import { validateContextPathInManifest } from "../../../../../src/services/diagnostics/validators/manifest-context-path";

let framework: TestFramework;

describe("manifest contextPath value validation", () => {
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

    cache.reset(); // to refresh context

    validateView = getViewValidator(
      framework,
      viewFilePathSegments,
      documentPath,
      validateContextPathInManifest
    );

    const i18n = await framework.initI18n();
    initI18n(i18n);
  }, 5 * 60000);

  describe("shows no issues when...", () => {
    const contextAdapter = prepareContextAdapter("/Travel");

    it("current attribute is not metaPath", async function () {
      const result = await validateView(
        `<macros:Chart id=""></macros:Chart>`,
        contextAdapter
      );
      expect(result.length).toEqual(0);
    });

    it("metaPath has missing value", async function () {
      const result = await validateView(
        `<macros:Chart metaPath></macros:Chart>`,
        contextAdapter
      );
      expect(result.length).toEqual(0);
    });

    it("metaPath contains binding expression", async function () {
      const result = await validateView(
        `<macros:Chart metaPath="{}"></macros:Chart>`,
        contextAdapter
      );
      expect(result.length).toEqual(0);
    });

    it("mainServicePath is empty", async function () {
      const result = await validateView(
        `<macros:Chart metaPath=""></macros:Chart>`,
        (c) => {
          return {
            ...c,
            manifestDetails: { ...c.manifestDetails, mainServicePath: "" },
          };
        }
      );
      expect(result.length).toEqual(0);
    });

    it("mainServicePath is not provided", async function () {
      const result = await validateView(
        `<macros:Chart metaPath=""></macros:Chart>`,
        (c) => {
          return {
            ...c,
            manifestDetails: {
              ...c.manifestDetails,
              mainServicePath: undefined,
            },
          };
        }
      );
      expect(result.length).toEqual(0);
    });

    it("service not found in manifest", async function () {
      const result = await validateView(
        `<macros:Chart metaPath=""></macros:Chart>`,
        (c) => {
          return {
            ...c,
            manifestDetails: {
              ...c.manifestDetails,
              mainServicePath: "unknown",
            },
          };
        }
      );
      expect(result.length).toEqual(0);
    });

    it("contextPath provided via attribute", async function () {
      const result = await validateView(
        `<macros:Chart contextPath="/Travel/" metaPath="@com.sap.vocabularies.UI.v1.Chart#sample1"></macros:Field>`,

        contextAdapter
      );
      expect(result.length).toEqual(0);
    });

    it("contextPath attribute has no value", async function () {
      const result = await validateView(
        `<macros:Chart contextPath metaPath="@com.sap.vocabularies.UI.v1.Chart#sample1"></macros:Field>`,

        contextAdapter
      );
      expect(result.length).toEqual(0);
    });

    it("contextPath not provided in manifest", async function () {
      const result = await validateView(
        `<macros:Chart metaPath=""></macros:Chart>`,
        prepareContextAdapter(undefined)
      );
      expect(result.length).toEqual(0);
    });

    it("contextPath is empty", async function () {
      const result = await validateView(
        `<macros:Chart metaPath=""></macros:Chart>`,
        prepareContextAdapter("")
      );
      expect(result.length).toEqual(0);
    });

    it("contextPath is correct in manifest", async function () {
      const result = await validateView(
        `<macros:Chart metaPath=""></macros:Chart>`,
        contextAdapter
      );
      expect(result.length).toEqual(0);
    });
  });

  describe("shows issues when...", () => {
    it("contextPath is relative", async function () {
      const result = await validateView(
        `<macros:Chart metaPath=""></macros:Chart>`,
        prepareContextAdapter("to_Booking")
      );
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        'kind: InvalidAnnotationTarget; text: ContextPath in manifest "to_Booking" must be absolute. Attribute value completion and diagnostics are disabled; severity:warn; offset:344-345',
      ]);
    });

    it("contextPath is pointing to wrong target", async function () {
      const result = await validateView(
        `<macros:Chart metaPath=""></macros:Chart>`,
        prepareContextAdapter("/Booking/BookingID")
      );
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        "kind: UnknownEnumValue; text: Invalid contextPath value. The path leads to Edm.Property, but expected types are: Edm.EntityType,Edm.EntitySet,Edm.NavigationProperty; severity:warn; offset:344-345",
      ]);
    });

    it("contextPath is incomplete, i.e. pointing to entity container", async function () {
      const result = await validateView(
        `<macros:Chart metaPath=""></macros:Chart>`,
        prepareContextAdapter("/TravelService.EntityContainer")
      );
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        "kind: IncompletePath; text: ContextPath in manifest is incomplete. It leads to entity container. Attribute value completion and diagnostics are disabled; severity:warn; offset:344-345",
      ]);
    });

    it("contextPath contains multiple 1-many segments", async function () {
      const result = await validateView(
        `<macros:Chart metaPath=""></macros:Chart>`,
        prepareContextAdapter("/Travel/to_Booking/to_Travel/to_Booking")
      );
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        "kind: UnknownEnumValue; text: Invalid contextPath in manifest. Multiple 1:many association segments not allowed. Attribute value completion and diagnostics are disabled; severity:warn; offset:344-345",
      ]);
    });

    it("contextPath can not be resolved", async function () {
      const result = await validateView(
        `<macros:Chart metaPath=""></macros:Chart>`,
        prepareContextAdapter("/Booking_")
      );
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        'kind: UnknownEnumValue; text: Unknown contextPath in manifest "/Booking_". Attribute value completion and diagnostics are disabled; severity:warn; offset:344-345',
      ]);
    });
  });
});
