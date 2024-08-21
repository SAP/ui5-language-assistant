import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
} from "@ui5-language-assistant/test-framework";
import { join } from "path";
import { getViewFiles } from "../../../src/utils";
import { cache } from "../../../src/cache";
import type { XMLDocument } from "@xml-tools/ast";
import { FileChangeType } from "vscode-languageserver/node";

const getManifestPath = (projectRoot: string) =>
  join(projectRoot, "app", "manage_travels", "webapp", "manifest.json");
const getDocumentPath = (projectRoot: string) =>
  join(
    projectRoot,
    "app",
    "manage_travels",
    "webapp",
    "ext",
    "main",
    "Main.view.xml"
  );

describe("view-files", () => {
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
    jest.resetAllMocks();
  });

  it("get cached view files - with no content", async () => {
    // arrange
    const getViewFilesStub = jest
      .spyOn(cache, "getViewFiles")
      .mockReturnValue({ documentPath: {} as XMLDocument });

    const projectRoot = testFramework.getProjectRoot();
    const documentPath = getDocumentPath(projectRoot);
    const manifestPath = getManifestPath(projectRoot);
    // act
    const viewFiles = await getViewFiles({ manifestPath, documentPath });
    // assert
    expect(getViewFilesStub).toHaveBeenCalledTimes(2);
    expect(Object.keys(viewFiles).length).toBeGreaterThan(0);
  });

  it("get cached view files - with content", async () => {
    // arrange
    const getViewFilesStub = jest
      .spyOn(cache, "getViewFiles")
      .mockReturnValue({ documentPath: {} as XMLDocument });
    const setViewFileStub = jest
      .spyOn(cache, "setViewFile")
      .mockResolvedValue();
    const content = `<dummy/>`;
    const projectRoot = testFramework.getProjectRoot();
    const documentPath = getDocumentPath(projectRoot);
    const manifestPath = getManifestPath(projectRoot);
    // act
    const viewFiles = await getViewFiles({
      manifestPath,
      documentPath,
      content,
    });
    // assert
    expect(getViewFilesStub).toHaveBeenCalledTimes(2);
    expect(setViewFileStub).toHaveBeenNthCalledWith(1, {
      manifestPath,
      documentPath,
      operation: FileChangeType.Created,
      content,
    });
    expect(Object.keys(viewFiles).length).toBeGreaterThan(0);
  });

  it("get view files", async () => {
    // arrange
    cache.reset();
    const getViewFilesStub = jest
      .spyOn(cache, "getViewFiles")
      .mockReturnValue({});
    const projectRoot = testFramework.getProjectRoot();
    const documentPath = getDocumentPath(projectRoot);
    const manifestPath = getManifestPath(projectRoot);
    // act
    const viewFiles = await getViewFiles({
      manifestPath,
      documentPath,
    });
    // assert
    expect(getViewFilesStub).toHaveBeenCalledTimes(1);
    expect(Object.keys(viewFiles).length).toBeGreaterThan(1);
    expect(viewFiles[documentPath]).toBeDefined();
  });
});
