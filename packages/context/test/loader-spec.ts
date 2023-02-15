import { expect } from "chai";
import { join } from "path";
import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
} from "@ui5-language-assistant/test-framework";
import * as parser from "../src/parser";
import * as loader from "../src/loader";
import * as manifest from "../src/manifest";
import * as projectUtils from "../src/utils/project";
import { cache } from "../src/cache";
import { restore, spy, stub } from "sinon";
import { Manifest } from "@sap-ux/project-access";
import { ProjectKind, UI5_PROJECT_TYPE } from "../src/types";
import { getProjectData } from "./utils";
import { getManifestDetails, getUI5Manifest } from "../src/manifest";
import { getApp } from "../src/loader";

describe("loader", () => {
  let testFramework: TestFramework;
  before(function () {
    const timeout = 5 * 60000 + 10000; // 5 min for initial npm install + 10 sec
    this.timeout(timeout);
    const useConfig: Config = {
      projectInfo: {
        name: ProjectName.cap,
        type: ProjectType.CAP,
        npmInstall: true,
      },
    };
    testFramework = new TestFramework(useConfig);
  });
  afterEach(() => {
    restore();
  });
  context("getApp", () => {
    it("get an app", async () => {
      const projectRoot = testFramework.getProjectRoot();
      const {
        appRoot,
        manifest,
        manifestDetails,
        projectInfo,
      } = await getProjectData(projectRoot);
      // for consistency remove cache
      cache.deleteApp(appRoot);
      const app = await loader.getApp(
        projectRoot,
        appRoot,
        manifest,
        manifestDetails,
        projectInfo
      );
      expect(app).to.have.all.keys(
        "appRoot",
        "projectRoot",
        "manifest",
        "manifestDetails",
        "localServices"
      );
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
      expect(app).to.have.all.keys(
        "appRoot",
        "projectRoot",
        "manifest",
        "manifestDetails",
        "localServices"
      );
    });

    it("get cached app", async () => {
      const projectRoot = testFramework.getProjectRoot();
      const {
        appRoot,
        manifest,
        manifestDetails,
        projectInfo,
      } = await getProjectData(projectRoot);
      const getAppSpy = spy(cache, "getApp");
      const app = await loader.getApp(
        projectRoot,
        appRoot,
        manifest,
        manifestDetails,
        projectInfo
      );
      expect(getAppSpy).to.have.been.called;
      expect(app).to.deep.equal(getAppSpy.returnValues[0]);
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
      expect(app?.localServices.size).to.eq(0);
    });
    it("does not parse service files and returns undefined", async () => {
      const parseServiceFilesStub = stub(parser, "parseServiceFiles").returns(
        undefined
      );
      const projectRoot = testFramework.getProjectRoot();
      const {
        appRoot,
        manifestDetails,
        manifest,
        projectInfo,
      } = await getProjectData(projectRoot);
      // for consistency remove cache
      cache.deleteApp(appRoot);
      const app = await getApp(
        projectRoot,
        appRoot,
        manifest,
        manifestDetails,
        projectInfo
      );
      expect(parseServiceFilesStub).to.have.been.called;
      expect(app?.localServices.size).to.eq(0);
    });
  });
  context("getCAPProject", () => {
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
      expect(capProject).to.be.undefined;
    });
    it("return CAP project for NodeJS", async () => {
      const projectRoot = testFramework.getProjectRoot();
      const {
        appRoot,
        manifest,
        manifestDetails,
        projectInfo,
      } = await getProjectData(projectRoot);
      const capProject = await loader.getCAPProject(
        projectRoot,
        projectInfo,
        appRoot,
        manifest,
        manifestDetails
      );
      expect(capProject).to.have.all.keys("type", "kind", "root", "apps");
    });
  });
  context("getUI5Project", () => {
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
      expect(ui5Project).to.have.all.keys("type", "root", "app");
    });
  });
  context("getProject", () => {
    it("does not fine project root and return undefined", async () => {
      const getProjectRootStub = stub(projectUtils, "getProjectRoot").resolves(
        undefined
      );
      const wrongDocPath = __dirname;
      const project = await loader.getProject(wrongDocPath);
      expect(getProjectRootStub).to.have.been.called;
      expect(project).to.be.undefined;
    });
    it("does not fine app root and return undefined", async () => {
      const getProjectRootStub = stub(projectUtils, "getProjectRoot").resolves(
        "stub-project-root"
      );
      const findAppRootStub = stub(projectUtils, "findAppRoot").resolves(
        undefined
      );
      const wrongDocPath = "/wrong/path";
      const project = await loader.getProject(wrongDocPath);
      expect(getProjectRootStub).to.have.been.called;
      expect(findAppRootStub).to.have.been.called;
      expect(project).to.be.undefined;
    });
    it("does not fine manifest path and return undefined", async () => {
      const getProjectRootStub = stub(projectUtils, "getProjectRoot").resolves(
        "stub-project-root"
      );
      const findAppRootStub = stub(projectUtils, "findAppRoot").resolves(
        "stub-app-root"
      );
      const findManifestPathStub = stub(manifest, "findManifestPath").resolves(
        undefined
      );
      const wrongDocPath = "/wrong/path";
      const project = await loader.getProject(wrongDocPath);
      expect(getProjectRootStub).to.have.been.called;
      expect(findAppRootStub).to.have.been.called;
      expect(findManifestPathStub).to.have.been.called;
      expect(project).to.be.undefined;
    });
    it("does not fine manifest and return undefined", async () => {
      const getProjectRootStub = stub(projectUtils, "getProjectRoot").resolves(
        "stub-project-root"
      );
      const findAppRootStub = stub(projectUtils, "findAppRoot").resolves(
        "stub-app-root"
      );
      const findManifestPathStub = stub(manifest, "findManifestPath").resolves(
        "stub-manifest-path"
      );
      const getUI5ManifestStub = stub(manifest, "getUI5Manifest").resolves(
        undefined
      );
      const wrongDocPath = __dirname;
      const project = await loader.getProject(wrongDocPath);
      expect(getProjectRootStub).to.have.been.called;
      expect(findAppRootStub).to.have.been.called;
      expect(findManifestPathStub).to.have.been.called;
      expect(getUI5ManifestStub).to.have.been.called;
      expect(project).to.be.undefined;
    });
    it("does not fine manifest and return undefined", async () => {
      const getProjectRootStub = stub(projectUtils, "getProjectRoot").resolves(
        "stub-project-root"
      );
      const findAppRootStub = stub(projectUtils, "findAppRoot").resolves(
        "stub-app-root"
      );
      const findManifestPathStub = stub(manifest, "findManifestPath").resolves(
        "stub-manifest-path"
      );
      const getUI5ManifestStub = stub(manifest, "getUI5Manifest").resolves(
        ("stub-get-manifest" as unknown) as Manifest
      );
      const getProjectInfoStub = stub(projectUtils, "getProjectInfo").resolves(
        undefined
      );
      const wrongDocPath = __dirname;
      const project = await loader.getProject(wrongDocPath);
      expect(getProjectRootStub).to.have.been.called;
      expect(findAppRootStub).to.have.been.called;
      expect(findManifestPathStub).to.have.been.called;
      expect(getUI5ManifestStub).to.have.been.called;
      expect(getProjectInfoStub).to.have.been.called;
      expect(project).to.be.undefined;
    });
    it("return CAP project", async () => {
      const { appRoot } = await getProjectData(testFramework.getProjectRoot());
      const docPath = join(appRoot, "ext", "main", "Main.view.xml");
      const project = await loader.getProject(docPath);
      expect(project).to.have.all.keys("type", "kind", "root", "apps");
    });
    it("return cached project", async () => {
      const getProjectSpy = spy(cache, "getProject");
      const { appRoot } = await getProjectData(testFramework.getProjectRoot());
      const docPath = join(appRoot, "ext", "main", "Main.view.xml");
      const project = await loader.getProject(docPath);
      expect(project).to.deep.equal(getProjectSpy.returnValues[0]);
    });
    it("return UI5 project", async () => {
      // stub getProjectInfo to avoid another UI5 test project
      const getProjectInfoStub = stub(projectUtils, "getProjectInfo").resolves({
        type: UI5_PROJECT_TYPE,
        kind: "UI5",
      });
      const projectRoot = testFramework.getProjectRoot();
      const { appRoot } = await getProjectData(projectRoot);
      const docPath = join(appRoot, "ext", "main", "Main.view.xml");
      // for consistency remove cache
      cache.deleteProject(projectRoot);
      const project = await loader.getProject(docPath);
      expect(getProjectInfoStub).to.have.been.called;
      expect(project).to.have.all.keys("type", "root", "app");
    });
  });
});
