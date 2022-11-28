import { cache } from "../src/cache";
import { expect } from "chai";
import { fileURLToPath } from "url";
import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
} from "@ui5-language-assistant/test-framework";
import { restore, spy } from "sinon";
import * as loader from "../src/loader";
import {
  reactOnCdsFileChange,
  reactOnManifestChange,
  reactOnUI5YamlChange,
  reactOnXmlFileChange,
} from "../src/watcher";
import { CAPProject } from "../src/types";
import { URI } from "vscode-uri";

describe("watcher", () => {
  let testFramework: TestFramework;
  before(function () {
    const timeout = 5 * 60000 + 8000; // 5 min for initial npm install + 8 sec
    this.timeout(timeout);
    const useConfig: Config = {
      projectInfo: {
        name: ProjectName.cap,
        type: ProjectType.cap,
        npmInstall: true,
      },
    };
    testFramework = new TestFramework(useConfig);
  });
  afterEach(() => {
    restore();
  });
  it("reactOnManifestChange - cap project", async () => {
    // reset cache for consistency
    cache.reset();
    // creating file uri and file path to have same key
    // On windows, `C` drive is convert to lower case when getting file uri
    const fileUri = testFramework.getFileUri([
      "app",
      "manage_travels",
      "webapp",
      "ext",
      "main",
      "Main.view.xml",
    ]);
    const documentPath = URI.parse(fileUri).fsPath;
    // first create all caches
    await loader.getProject(documentPath);
    // spy on cache events and getProject
    const setManifestSpy = spy(cache, "setManifest");
    const deleteManifestSpy = spy(cache, "deleteManifest");
    const deleteAppSpy = spy(cache, "deleteApp");
    const setAppSpy = spy(cache, "setApp");
    const deleteProjectSpy = spy(cache, "deleteProject");
    const setProjectSpy = spy(cache, "setProject");
    const getProjectSpy = spy(loader, "getProject");
    const manifestUri = testFramework.getFileUri([
      "app",
      "manage_travels",
      "webapp",
      "manifest.json",
    ]);
    await reactOnManifestChange(manifestUri, 1);
    const projectRoot = fileURLToPath(testFramework.getFileUri([]));
    const cachedProject = cache.getProject(projectRoot) as CAPProject;

    expect(deleteManifestSpy).to.have.been.calledOnce;
    expect(setManifestSpy).to.have.been.calledOnce;
    expect(deleteAppSpy).to.have.been.calledOnce;
    expect(setAppSpy).to.have.been.calledOnce;
    expect(deleteProjectSpy).to.have.been.calledOnce;
    expect(setProjectSpy).to.have.been.calledOnce;
    expect(getProjectSpy).to.have.been.calledOnce;
    expect(cachedProject.apps.size).to.equal(1);
  });
  context("reactOnUI5YamlChange", () => {
    it("test create or change operation", async () => {
      // reset cache for consistency
      cache.reset();
      const fileUri = testFramework.getFileUri([
        "app",
        "manage_travels",
        "ui5.yaml",
      ]);
      // spy on cache events
      const setYamlDetailsSpy = spy(cache, "setYamlDetails");
      await reactOnUI5YamlChange(fileUri, 1);

      expect(setYamlDetailsSpy).to.have.been.calledOnce;
    });
    it("test delete operation", async () => {
      // reset cache for consistency
      cache.reset();
      const fileUri = testFramework.getFileUri([
        "app",
        "manage_travels",
        "ui5.yaml",
      ]);
      // spy on cache events
      const deleteYamlDetailsSpy = spy(cache, "deleteYamlDetails");
      await reactOnUI5YamlChange(fileUri, 3);

      expect(deleteYamlDetailsSpy).to.have.been.calledOnce;
    });
  });
  context("reactOnCdsFileChange", async () => {
    it("single cds file", async () => {
      // reset cache for consistency
      cache.reset();
      // creating file uri and file path to have same key
      // On windows, `C` drive is convert to lower case when getting file uri
      const fileUri = testFramework.getFileUri([
        "app",
        "manage_travels",
        "webapp",
        "ext",
        "main",
        "Main.view.xml",
      ]);
      const documentPath = URI.parse(fileUri).fsPath;
      // first create all caches
      await loader.getProject(documentPath);
      // spy on cache events and getProject
      const deleteCapServicesSpy = spy(cache, "deleteCapServices");
      const setCapServicesSpy = spy(cache, "setCapServices");
      const deleteAppSpy = spy(cache, "deleteApp");
      const setAppSpy = spy(cache, "setApp");
      const cdsUri = testFramework.getFileUri([
        "app",
        "manage_travels",
        "annotations.cds",
      ]);
      await reactOnCdsFileChange([{ uri: cdsUri, type: 1 }]);
      const projectRoot = fileURLToPath(testFramework.getFileUri([]));
      const cachedProject = cache.getProject(projectRoot) as CAPProject;

      expect(deleteCapServicesSpy).to.have.been.calledOnce;
      expect(setCapServicesSpy).to.have.been.calledOnce;
      expect(deleteAppSpy).to.have.been.calledOnce;
      expect(setAppSpy).to.have.been.calledOnce;
      expect(cachedProject.apps.size).to.equal(1);
    });
    it("two or more cds files - only one time recompilation and procession for same project root", async () => {
      // reset cache for consistency
      cache.reset();
      // creating file uri and file path to have same key
      // On windows, `C` drive is convert to lower case when getting file uri
      const fileUri = testFramework.getFileUri([
        "app",
        "manage_travels",
        "webapp",
        "ext",
        "main",
        "Main.view.xml",
      ]);
      const documentPath = URI.parse(fileUri).fsPath;
      // first create all caches
      await loader.getProject(documentPath);
      // spy on cache events and getProject
      const deleteCapServicesSpy = spy(cache, "deleteCapServices");
      const setCapServicesSpy = spy(cache, "setCapServices");
      const deleteAppSpy = spy(cache, "deleteApp");
      const setAppSpy = spy(cache, "setApp");
      const cdsUri01 = testFramework.getFileUri([
        "app",
        "manage_travels",
        "annotations.cds",
      ]);
      const cdsUri02 = testFramework.getFileUri(["app", "labels.cds"]);
      await reactOnCdsFileChange([
        { uri: cdsUri01, type: 1 },
        { uri: cdsUri02, type: 1 },
      ]);
      const projectRoot = fileURLToPath(testFramework.getFileUri([]));
      const cachedProject = cache.getProject(projectRoot) as CAPProject;

      expect(deleteCapServicesSpy).to.have.been.calledOnce;
      expect(setCapServicesSpy).to.have.been.calledOnce;
      expect(deleteAppSpy).to.have.been.calledOnce;
      expect(setAppSpy).to.have.been.calledOnce;
      expect(cachedProject.apps.size).to.equal(1);
    });
  });
  context("reactOnXmlFileChange", async () => {
    it("test unregistered xml file", async () => {
      // reset cache for consistency
      cache.reset();
      // creating file uri and file path to have same key
      // On windows, `C` drive is convert to lower case when getting file uri
      const fileUri = testFramework.getFileUri([
        "app",
        "manage_travels",
        "webapp",
        "ext",
        "main",
        "Main.view.xml",
      ]);
      const documentPath = URI.parse(fileUri).fsPath;
      // first create all caches
      await loader.getProject(documentPath);
      // spy on cache events and getProject
      const deleteAppSpy = spy(cache, "deleteApp");
      await reactOnXmlFileChange(fileUri, 1);

      expect(deleteAppSpy).not.to.have.been.calledOnce;
    });
    it("test registered xml file", async () => {
      // reset cache for consistency
      cache.reset();
      // creating file uri and file path to have same key
      // On windows, `C` drive is convert to lower case when getting file uri
      const fileUri = testFramework.getFileUri([
        "app",
        "manage_travels",
        "webapp",
        "annotations",
        "annotation.xml",
      ]);
      const documentPath = URI.parse(fileUri).fsPath;
      // first create all caches
      await loader.getProject(documentPath);
      // spy on cache events and getProject
      const deleteAppSpy = spy(cache, "deleteApp");
      const setAppSpy = spy(cache, "setApp");
      const deleteProjectSpy = spy(cache, "deleteProject");
      const setProjectSpy = spy(cache, "setProject");
      const getProjectSpy = spy(loader, "getProject");
      await reactOnXmlFileChange(fileUri, 1);
      const projectRoot = fileURLToPath(testFramework.getFileUri([]));
      const cachedProject = cache.getProject(projectRoot) as CAPProject;

      expect(deleteAppSpy).to.have.been.calledOnce;
      expect(setAppSpy).to.have.been.calledOnce;
      expect(deleteProjectSpy).to.have.been.calledOnce;
      expect(setProjectSpy).to.have.been.calledOnce;
      expect(getProjectSpy).to.have.been.calledOnce;
      expect(cachedProject.apps.size).to.equal(1);
    });
  });
});
