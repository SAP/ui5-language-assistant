import { App, Project } from "../../src/types";
import { cache } from "../../src/cache";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import type { XMLDocument } from "@xml-tools/ast";
import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
} from "@ui5-language-assistant/test-framework";
import { join } from "path";

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

describe("cache", () => {
  let testFramework: TestFramework;
  beforeAll(function () {
    const useConfig: Config = {
      projectInfo: {
        name: ProjectName.cap,
        type: ProjectType.CAP,
        npmInstall: true,
      },
    };
    testFramework = new TestFramework(useConfig);
  }, 5 * 60000 + 10000); // 5 min for initial npm install + 10 sec

  afterEach(() => {
    cache.reset();
    jest.restoreAllMocks();
  });

  it("show singleton instance", async () => {
    cache.setApp("key01", {} as unknown as App);
    // importing again - no new instance is generated
    const cacheModule = await import("../../src/cache");
    expect(cache.getAppEntries()).toStrictEqual(
      cacheModule.cache.getAppEntries()
    );
  });

  describe("reading keys", () => {
    it("project", () => {
      cache.setProject("dummyRoot1", {} as unknown as Project);
      expect(cache.getProjectEntries()).toContainEqual("dummyRoot1");
    });

    it("services", () => {
      cache.setCAPServices("dummyRoot2", new Map());
      expect(cache.getCAPServiceEntries()).toContainEqual("dummyRoot2");
    });

    it("model", () => {
      cache.setUI5Model("dummyRoot3", {} as unknown as UI5SemanticModel);
      expect(cache.getUI5ModelEntries()).toContainEqual("dummyRoot3");
      const result = cache.deleteUI5Model("dummyRoot3");
      expect(result).toBeTrue();
      expect(cache.getUI5ModelEntries()).toBeEmpty();
    });
  });

  it("view files", () => {
    cache.setViewFiles("manifest.json", { file: {} as XMLDocument });
    expect(cache.getViewFiles("manifest.json")).toEqual({ file: {} });
  });
  it("setViewFile - create", async () => {
    // arrange
    const projectRoot = testFramework.getProjectRoot();
    const manifestPath = getManifestPath(projectRoot);
    const documentPath = getDocumentPath(projectRoot);
    // act
    await cache.setViewFile({
      manifestPath,
      documentPath,
      operation: "create",
    });
    // assert
    const cachedData = cache.getViewFiles(manifestPath)[documentPath];
    expect(cachedData).toBeDefined();
  });
  it("setViewFile - delete", async () => {
    // arrange
    const projectRoot = testFramework.getProjectRoot();
    const manifestPath = getManifestPath(projectRoot);
    const documentPath = getDocumentPath(projectRoot);
    // set view file
    const data = {};
    data[documentPath] = {};
    cache.setViewFiles(manifestPath, data);
    // act
    await cache.setViewFile({
      manifestPath,
      documentPath,
      operation: "delete",
    });
    // assert
    const cachedData = cache.getViewFiles(manifestPath)[documentPath];
    expect(cachedData).toBeUndefined();
  });
  it("control ids", () => {
    const data = {};
    data["manifest.json"] = new Map();
    cache.setControlIds("manifest.json", data);
    expect(cache.getControlIds("manifest.json")).toEqual(data);
  });
  it("setControlIdsForViewFile - create", async () => {
    // arrange
    const projectRoot = testFramework.getProjectRoot();
    const manifestPath = getManifestPath(projectRoot);
    const documentPath = getDocumentPath(projectRoot);
    // create view file entry
    await cache.setViewFile({
      manifestPath,
      documentPath,
      operation: "create",
    });
    // create controls id
    const data = {};
    data[documentPath] = new Map();
    cache.setControlIds(manifestPath, data);
    // act
    cache.setControlIdsForViewFile({
      manifestPath,
      documentPath,
      operation: "create",
    });
    // assert
    const cachedData = cache.getControlIds(manifestPath)[documentPath];
    expect(cachedData.get("Main")).toBeDefined();
  });
  it("setControlIdsForViewFile - delete", () => {
    // arrange
    const projectRoot = testFramework.getProjectRoot();
    const manifestPath = getManifestPath(projectRoot);
    const documentPath = getDocumentPath(projectRoot);
    // create controls id
    const data = {};
    data[documentPath] = new Map();
    cache.setControlIds(manifestPath, data);
    // act
    cache.setControlIdsForViewFile({
      manifestPath,
      documentPath,
      operation: "delete",
    });
    // assert
    const cachedData = cache.getControlIds(manifestPath)[documentPath];
    expect(cachedData).toBeUndefined();
  });
});
