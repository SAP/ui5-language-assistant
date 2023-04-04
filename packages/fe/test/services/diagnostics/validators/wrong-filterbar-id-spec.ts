import { expect } from "chai";
import { join } from "path";
import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
} from "@ui5-language-assistant/test-framework";

import { validateFilterBarId } from "../../../../src/services/diagnostics/validators/wrong-filter-bar-id";
import {
  getViewValidator,
  issueToSnapshot,
  ViewValidatorType,
} from "../../utils";
import { initI18n } from "../../../../src/api";

let framework: TestFramework;

describe("filterBar attribute value validation", () => {
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
    validateView = getViewValidator(
      framework,
      viewFilePathSegments,
      documentPath,
      validateFilterBarId
    );

    const i18n = await framework.initI18n();
    initI18n(i18n);
  });

  describe("shows no issues when...", () => {
    it("value is correct", async function () {
      const result = await validateView(
        `
        <macros:FilterBar id="fb1" ></macros:Chart>
        <macros:Table filterBar="fb1"></macros:Table>
      `,
        this
      );
      expect(result.length).to.eq(0);
    });

    it("value is empty and no FilterBar elements found", async function () {
      const result = await validateView(
        `<macros:Table filterBar=""></macros:Table>`,
        this
      );
      expect(result.length).to.eq(0);
    });

    it("attribute value is absent", async function () {
      const result = await validateView(
        `<macros:Table filterBar></macros:Field>`,
        this
      );
      expect(result.length).to.eq(0);
    });
  });

  it("shows warning when is is not empty and no filterBar macros elements in the document", async function () {
    const result = await validateView(
      `<macros:Table filterBar="test"></macros:Table>`,
      this
    );
    expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
      'kind: UnknownEnumValue; text: FilterBar with id "test" does not exist; severity:warn; offset:345-350',
    ]);
  });

  it("shows warning when id is missing", async function () {
    const result = await validateView(
      `
      <macros:FilterBar id="fb1" ></macros:Chart>
      <macros:Table filterBar=""></macros:Table>
    `,
      this
    );
    expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
      "kind: UnknownEnumValue; text: Trigger code completion to choose one of existing FilterBar ids; severity:warn; offset:402-403",
    ]);
  });

  it("shows warning when id is wrong", async function () {
    const result = await validateView(
      `
      <macros:FilterBar id="fb1" ></macros:Chart>
      <macros:FilterBar ></macros:Chart>
      <macros:Table filterBar="test"></macros:Table>
    `,
      this
    );
    expect(result.map((item) => issueToSnapshot(item))).to.deep.equal([
      'kind: UnknownEnumValue; text: FilterBar with id "test" does not exist. Trigger code completion to choose one of existing FilterBar ids; severity:warn; offset:443-448',
    ]);
  });
});
