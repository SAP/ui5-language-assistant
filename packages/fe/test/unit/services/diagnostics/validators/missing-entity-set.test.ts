import { join } from "path";
import { Context } from "@ui5-language-assistant/context";
import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
} from "@ui5-language-assistant/test-framework";

import { validateMissingViewEntitySet } from "../../../../../src/services/diagnostics/validators/missing-entity-set";
import {
  getViewValidator,
  issueToSnapshot,
  ViewValidatorType,
} from "../../utils";
import { initI18n } from "../../../../../src/api";

let framework: TestFramework;

describe("missing entitySet validation", () => {
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

    validateView = getViewValidator(
      framework,
      viewFilePathSegments,
      documentPath,
      validateMissingViewEntitySet
    );

    const i18n = await framework.initI18n();
    initI18n(i18n);
  }, 5 * 60000);

  describe("shows warning when...", () => {
    it("entitySet is absent in manifest", async function () {
      const result = await validateView(
        `<macros:Chart metaPath="@UI.Chart"></macros:Chart>`,
        (c) => {
          const newContext = {
            ...c,
            manifestDetails: { ...c.manifestDetails, customViews: {} },
          };
          return newContext;
        }
      );
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        "kind: MissingEntitySet; text: EntitySet or contextPath for the current view are not defined in application manifest. Attribute value completion and diagnostics is not possible if EntitySet or contextPath are not defined or defined dynamically in controllers; severity:info; offset:344-354",
      ]);
    });

    it("service details are missing in manifest", async function () {
      const result = await validateView(
        `<macros:Chart metaPath="test"></macros:Chart>`,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (c) => ({ ...c, manifestDetails: undefined } as any)
      );
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        "kind: MissingEntitySet; text: EntitySet or contextPath for the current view are not defined in application manifest. Attribute value completion and diagnostics is not possible if EntitySet or contextPath are not defined or defined dynamically in controllers; severity:info; offset:344-349",
      ]);
    });

    it("custom view id not determined", async function () {
      const result = await validateView(
        `<macros:Chart metaPath="test"></macros:Chart>`,
        (c) => {
          const newContext: Context = {
            ...c,
            customViewId: "",
          };
          return newContext;
        }
      );
      expect(result.map((item) => issueToSnapshot(item))).toStrictEqual([
        "kind: MissingEntitySet; text: EntitySet or contextPath for the current view are not defined in application manifest. Attribute value completion and diagnostics is not possible if EntitySet or contextPath are not defined or defined dynamically in controllers; severity:info; offset:344-349",
      ]);
    });
  });

  describe("does not show warning when...", () => {
    it("entitySet exists in manifest", async function () {
      const result = await validateView(
        `<macros:Chart metaPath=""></macros:Chart>`
      );
      expect(result.length).toEqual(0);
    });

    it("attribute value is absent", async function () {
      const result = await validateView(
        `<macros:Chart metaPath></macros:Chart>`
      );
      expect(result.length).toEqual(0);
    });

    it("contextPath exists", async function () {
      const result = await validateView(
        `<macros:Chart contextPath="/Travel" metaPath="@UI.Chart"></macros:Chart>`
      );
      expect(result.length).toEqual(0);
    });
  });
});
