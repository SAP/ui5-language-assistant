import { join } from "path";
import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
} from "@ui5-language-assistant/test-framework";
import * as parser from "../../src/parser";
import * as loader from "../../src/loader";
import * as manifest from "../../src/manifest";
import * as projectUtils from "../../src/utils/project";
import { cache } from "../../src/cache";
import { Manifest } from "@sap-ux/project-access";
import { ProjectKind, UI5_PROJECT_TYPE } from "../../src/types";
import { getProjectData } from "./utils";
import { getManifestDetails, getUI5Manifest } from "../../src/manifest";
import { getApp } from "../../src/loader";

describe("loader", () => {
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
    jest.restoreAllMocks();
  });

  describe("getApp", () => {
    it("get an app", async () => {
      const projectRoot = testFramework.getProjectRoot();
      const { appRoot, manifest, manifestDetails, projectInfo } =
        await getProjectData(projectRoot);
      // for consistency remove cache
      cache.deleteApp(appRoot);
      const app = await loader.getApp(
        projectRoot,
        appRoot,
        manifest,
        manifestDetails,
        projectInfo
      );
      expect(app).toContainAllKeys([
        "appRoot",
        "projectRoot",
        "manifest",
        "manifestDetails",
        "localServices",
      ]);
    });

    it("get an app without models", async () => {
      const framework = new TestFramework({
        projectInfo: {
          name: ProjectName.tsFreeStyle,
          type: ProjectType.UI5,
          npmInstall: false,
        },
      });
      const projectRoot = framework.getProjectRoot();
      const appRoot = join(projectRoot, "src");
      const manifestRoot = join(appRoot, "manifest.json");
      const manifest = (await getUI5Manifest(manifestRoot)) as Manifest;
      const documentPath = join(
        projectRoot,

        "src",
        "view",
        "Main.view.xml"
      );
      const manifestDetails = await getManifestDetails(documentPath);
      // for consistency remove cache
      cache.deleteApp(appRoot);
      const app = await loader.getApp(
        projectRoot,
        appRoot,
        manifest,
        manifestDetails,
        {
          type: "UI5",
          kind: "UI5",
        }
      );
      expect(app).toContainAllKeys([
        "appRoot",
        "projectRoot",
        "manifest",
        "manifestDetails",
        "localServices",
      ]);
    });

    it("get cached app", async () => {
      const projectRoot = testFramework.getProjectRoot();
      const { appRoot, manifest, manifestDetails, projectInfo } =
        await getProjectData(projectRoot);
      const getAppSpy = jest.spyOn(cache, "getApp");
      const app = await loader.getApp(
        projectRoot,
        appRoot,
        manifest,
        manifestDetails,
        projectInfo
      );
      expect(getAppSpy).toHaveBeenCalled();
      expect(app).toStrictEqual(getAppSpy.mock.results[0].value);
    });
    it("does not find mainService and returns empty services", async () => {
      const projectRoot = testFramework.getProjectRoot();
      const { appRoot, manifestDetails, projectInfo } = await getProjectData(
        projectRoot
      );
      const manifest = {} as Manifest;
      // for consistency remove cache
      cache.deleteApp(appRoot);
      const app = await loader.getApp(
        projectRoot,
        appRoot,
        manifest,
        manifestDetails,
        projectInfo
      );
      expect(app?.localServices.size).toEqual(0);
    });
    it("does not parse service files and returns empty services", async () => {
      const parseServiceFilesStub = jest
        .spyOn(parser, "parseServiceFiles")
        .mockReturnValue(undefined);
      const projectRoot = testFramework.getProjectRoot();
      const { appRoot, manifestDetails, manifest, projectInfo } =
        await getProjectData(projectRoot);
      // for consistency remove cache
      cache.deleteApp(appRoot);
      const app = await getApp(
        projectRoot,
        appRoot,
        manifest,
        manifestDetails,
        projectInfo
      );
      expect(parseServiceFilesStub).toHaveBeenCalled();
      expect(app?.localServices.size).toEqual(0);
    });
  });
  describe("getCAPProject", () => {
    it("return undefined for Java project", async () => {
      const projectRoot = testFramework.getProjectRoot();
      const { appRoot, manifest, manifestDetails } = await getProjectData(
        projectRoot
      );
      const projectInfo = { kind: "Java", type: "CAP" } as {
        type: ProjectType;
        kind: ProjectKind;
      };
      const capProject = await loader.getCAPProject(
        projectRoot,
        projectInfo,
        appRoot,
        manifest,
        manifestDetails
      );
      expect(capProject).toBeUndefined();
    });
    it("return CAP project for NodeJS", async () => {
      const projectRoot = testFramework.getProjectRoot();
      const { appRoot, manifest, manifestDetails, projectInfo } =
        await getProjectData(projectRoot);
      const capProject = await loader.getCAPProject(
        projectRoot,
        projectInfo,
        appRoot,
        manifest,
        manifestDetails
      );
      expect(capProject).toContainAllKeys(["type", "kind", "root", "apps"]);
    });
  });
  describe("getUI5Project", () => {
    it("return UI5 project", async () => {
      const projectRoot = testFramework.getProjectRoot();
      const { appRoot, manifest, manifestDetails } = await getProjectData(
        projectRoot
      );
      const ui5Project = await loader.getUI5Project(
        projectRoot,
        appRoot,
        manifest,
        manifestDetails
      );
      expect(ui5Project).toContainAllKeys(["type", "root", "app"]);
    });
  });
  describe("getProject", () => {
    it("does not find project root and return undefined", async () => {
      const getProjectRootStub = jest
        .spyOn(projectUtils, "getProjectRoot")
        .mockResolvedValue(undefined);
      const wrongDocPath = __dirname;
      const project = await loader.getProject(wrongDocPath);
      expect(getProjectRootStub).toHaveBeenCalled();
      expect(project).toBeUndefined();
    });
    it("does not find app root and return undefined", async () => {
      const getProjectRootStub = jest
        .spyOn(projectUtils, "getProjectRoot")
        .mockResolvedValue("stub-project-root");
      const findAppRootStub = jest
        .spyOn(projectUtils, "findAppRoot")
        .mockResolvedValue(undefined);
      const wrongDocPath = "/wrong/path";
      const project = await loader.getProject(wrongDocPath);
      expect(getProjectRootStub).toHaveBeenCalled();
      expect(findAppRootStub).toHaveBeenCalled();
      expect(project).toBeUndefined();
    });
    it("does not find manifest path and return undefined", async () => {
      const getProjectRootStub = jest
        .spyOn(projectUtils, "getProjectRoot")
        .mockResolvedValue("stub-project-root");
      const findAppRootStub = jest
        .spyOn(projectUtils, "findAppRoot")
        .mockResolvedValue("stub-app-root");
      const findManifestPathStub = jest
        .spyOn(manifest, "findManifestPath")
        .mockResolvedValue(undefined);
      const wrongDocPath = "/wrong/path";
      const project = await loader.getProject(wrongDocPath);
      expect(getProjectRootStub).toHaveBeenCalled();
      expect(findAppRootStub).toHaveBeenCalled();
      expect(findManifestPathStub).toHaveBeenCalled();
      expect(project).toBeUndefined();
    });
    it("does not find manifest and return undefined", async () => {
      const getProjectRootStub = jest
        .spyOn(projectUtils, "getProjectRoot")
        .mockResolvedValue("stub-project-root");
      const findAppRootStub = jest
        .spyOn(projectUtils, "findAppRoot")
        .mockResolvedValue("stub-app-root");
      const findManifestPathStub = jest
        .spyOn(manifest, "findManifestPath")
        .mockResolvedValue("stub-manifest-path");
      const getUI5ManifestStub = jest
        .spyOn(manifest, "getUI5Manifest")
        .mockResolvedValue(undefined);
      const wrongDocPath = __dirname;
      const project = await loader.getProject(wrongDocPath);
      expect(getProjectRootStub).toHaveBeenCalled();
      expect(findAppRootStub).toHaveBeenCalled();
      expect(findManifestPathStub).toHaveBeenCalled();
      expect(getUI5ManifestStub).toHaveBeenCalled();
      expect(project).toBeUndefined();
    });
    it("does not find manifest and return undefined", async () => {
      const getProjectRootStub = jest
        .spyOn(projectUtils, "getProjectRoot")
        .mockResolvedValue("stub-project-root");
      const findAppRootStub = jest
        .spyOn(projectUtils, "findAppRoot")
        .mockResolvedValue("stub-app-root");
      const findManifestPathStub = jest
        .spyOn(manifest, "findManifestPath")
        .mockResolvedValue("stub-manifest-path");
      const getUI5ManifestStub = jest
        .spyOn(manifest, "getUI5Manifest")
        .mockResolvedValue("stub-get-manifest" as unknown as Manifest);
      const getProjectInfoStub = jest
        .spyOn(projectUtils, "getProjectInfo")
        .mockResolvedValue(undefined);
      const wrongDocPath = __dirname;
      const project = await loader.getProject(wrongDocPath);
      expect(getProjectRootStub).toHaveBeenCalled();
      expect(findAppRootStub).toHaveBeenCalled();
      expect(findManifestPathStub).toHaveBeenCalled();
      expect(getUI5ManifestStub).toHaveBeenCalled();
      expect(getProjectInfoStub).toHaveBeenCalled();
      expect(project).toBeUndefined();
    });
    it("return CAP project", async () => {
      const { appRoot } = await getProjectData(testFramework.getProjectRoot());
      const docPath = join(appRoot, "ext", "main", "Main.view.xml");
      const project = await loader.getProject(docPath);
      expect(project).toContainAllKeys(["type", "kind", "root", "apps"]);
    });
    it("return cached project", async () => {
      const getProjectSpy = jest.spyOn(cache, "getProject");
      const { appRoot } = await getProjectData(testFramework.getProjectRoot());
      const docPath = join(appRoot, "ext", "main", "Main.view.xml");
      const project = await loader.getProject(docPath);
      expect(project).toStrictEqual(getProjectSpy.mock.results[0].value);
    });
    it("return UI5 project", async () => {
      // stub getProjectInfo to avoid another UI5 test project
      const getProjectInfoStub = jest
        .spyOn(projectUtils, "getProjectInfo")
        .mockResolvedValue({
          type: UI5_PROJECT_TYPE,
          kind: "UI5",
        });
      const projectRoot = testFramework.getProjectRoot();
      const { appRoot } = await getProjectData(projectRoot);
      const docPath = join(appRoot, "ext", "main", "Main.view.xml");
      // for consistency remove cache
      cache.deleteProject(projectRoot);
      const project = await loader.getProject(docPath);
      expect(getProjectInfoStub).toHaveBeenCalled();
      expect(project).toContainAllKeys(["type", "root", "app"]);
    });
  });
});
