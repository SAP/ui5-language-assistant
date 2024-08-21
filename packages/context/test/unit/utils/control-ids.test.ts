import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
} from "@ui5-language-assistant/test-framework";
import { join } from "path";
import { getControlIds } from "../../../src/utils/control-ids";
import { getViewFiles } from "../../../src/utils";
import { cache } from "../../../src/cache";
import { FileChangeType } from "vscode-languageserver/node";
const getManifestPath = (projectRoot: string) =>
  join(projectRoot, "app", "manage_travels", "webapp", "manifest.json");
const mainViewSeg = [
  "app",
  "manage_travels",
  "webapp",
  "ext",
  "main",
  "Main.view.xml",
];
const getDocumentPath = (projectRoot: string) =>
  join(projectRoot, ...mainViewSeg);

describe("control-ids", () => {
  let testFramework: TestFramework;
  beforeAll(function () {
    const useConfig: Config = {
      projectInfo: {
        name: ProjectName.cap,
        type: ProjectType.CAP,
        npmInstall: false,
      },
    };
    testFramework = new TestFramework(useConfig);
  }, 5 * 60000);

  beforeEach(() => {
    cache.reset();
    jest.resetAllMocks();
  });

  it("getControlIds", async () => {
    // arrange
    const projectRoot = testFramework.getProjectRoot();
    const manifestPath = getManifestPath(projectRoot);
    const documentPath = getDocumentPath(projectRoot);
    // get view files to fill viewFiles cache
    await getViewFiles({ manifestPath, documentPath });
    // act
    const result = getControlIds({ manifestPath, documentPath });
    // assert
    expect(result).toBeDefined();
    expect(result.get("Main")).toBeDefined();
    // check cache. rebuild for current document
    const content = `
<mvc:View xmlns:core="sap.ui.core"
    xmlns:mvc="sap.ui.core.mvc"
    xmlns:f="sap.f"
    xmlns="sap.m"
    xmlns:l="sap.ui.layout"
    xmlns:macros="sap.fe.macros"
    xmlns:html="http://www.w3.org/1999/xhtml" controllerName="sap.fe.demo.managetravels.ext.main.Main">
    <Page id="myNewTestId" title="Main">
        <content>

        </content>
    </Page>
</mvc:View>
    `;
    // update view file with new content
    await cache.setViewFile({
      manifestPath,
      documentPath,
      operation: FileChangeType.Created,
      content,
    });
    await testFramework.updateFileContent(mainViewSeg, content);
    // act
    const resultCached = getControlIds({ manifestPath, documentPath, content });
    // assert
    expect(resultCached).toBeDefined();
    expect(resultCached.get("Main")).toBeUndefined();
    expect(resultCached.get("myNewTestId")).toBeDefined();
  });
});
