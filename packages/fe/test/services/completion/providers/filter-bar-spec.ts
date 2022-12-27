import { expect } from "chai";
import { join } from "path";
import { Context } from "@ui5-language-assistant/context";
import { CURSOR_ANCHOR } from "@ui5-language-assistant/test-framework";
import { Settings } from "@ui5-language-assistant/settings";

import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
} from "@ui5-language-assistant/test-framework";

import {
  completionItemToSnapshot,
  getViewCompletionProvider,
  ViewCompletionProviderType,
} from "../../utils";

let framework: TestFramework;

describe("filterBar id attribute value completion", () => {
  let root: string, uri: string, documentPath: string;
  let getCompletionResult: ViewCompletionProviderType;

  const viewFilePathSegments = [
    "app",
    "manage_travels",
    "webapp",
    "ext",
    "main",
    "Main.view.xml",
  ];
  const annoFileSegmentsCDS = ["app", "manage_travels", "annotations.cds"];
  const settings: Settings = {
    codeAssist: {
      deprecated: false,
      experimental: false,
    },
    logging: {
      level: "off",
    },
    trace: {
      server: "off",
    },
  };

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
    getCompletionResult = getViewCompletionProvider(
      framework,
      viewFilePathSegments,
      documentPath,
      uri,
      settings
    );
  });

  context("filterBar attribute completion", () => {
    it("id value completion", async function () {
      const result = await getCompletionResult(
        `
        <macros:FilterBar id="chart1" ></macros:FilterBar>
        <macros:FilterBar ></macros:FilterBar>
        <macros:FilterBar id="" ></macros:FilterBar>
        <macros:Table filterBar="${CURSOR_ANCHOR}"></macros:Table>`,
        this
      );
      expect(
        result.map((item) => completionItemToSnapshot(item))
      ).to.deep.equal([
        "label: chart1; text: chart1; kind:20; commit:undefined; sort:",
      ]);
    });

    it("UI5Property not found", async function () {
      const result = await getCompletionResult(
        `
      <macros:FilterBar id="chart1" ></macros:FilterBar>
      <macros:Table filterBar="${CURSOR_ANCHOR}"></macros:Table>
      `,
        this,
        (c) => {
          const newClasses = { ...c.ui5Model.classes };
          delete newClasses["sap.fe.macros.FilterBar"];
          const newContext: Context = {
            ...c,
            ui5Model: {
              ...c.ui5Model,
              classes: newClasses,
            },
          };
          return newContext;
        }
      );
      expect(result.length).to.eq(0);
    });
  });
});
