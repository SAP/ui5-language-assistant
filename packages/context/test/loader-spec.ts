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

describe("loader", () => {
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
  context("getApp", () => {
    it("get an app", async () => {
      const {
        appRoot,
        manifest,
        manifestDetails,
        projectInfo,
        projectRoot,
      } = await testFramework.getProjectData();
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
    it("get cached app", async () => {
      const {
        appRoot,
        manifest,
        manifestDetails,
        projectInfo,
        projectRoot,
      } = await testFramework.getProjectData();
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
    it("does not fined mainService and returns undefined", async () => {
      const {
        appRoot,
        manifestDetails,
        projectInfo,
        projectRoot,
      } = await testFramework.getProjectData();
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
      expect(app).to.be.undefined;
    });
    it("does not parser service files and returns undefined", async () => {
      const parseServiceFilesStub = stub(parser, "parseServiceFiles").returns(
        undefined
      );
      const {
        appRoot,
        manifestDetails,
        manifest,
        projectInfo,
        projectRoot,
      } = await testFramework.getProjectData();
      // for consistency remove cache
      cache.deleteApp(appRoot);
      const app = await loader.getApp(
        projectRoot,
        appRoot,
        manifest,
        manifestDetails,
        projectInfo
      );
      expect(parseServiceFilesStub).to.have.been.called;
      expect(app).to.be.undefined;
    });
  });
  context("getCAPProject", () => {
    it("return undefined for Java project", async () => {
      const {
        appRoot,
        manifest,
        manifestDetails,
        projectRoot,
      } = await testFramework.getProjectData();
      const projectInfo = { kind: "Java", type: "CAP" } as {
        type: "CAP" | "UI5";
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
    it("return cap project for NodeJS", async () => {
      const {
        appRoot,
        manifest,
        manifestDetails,
        projectRoot,
        projectInfo,
      } = await testFramework.getProjectData();
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
      const {
        appRoot,
        manifest,
        manifestDetails,
        projectRoot,
      } = await testFramework.getProjectData();
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
    it("does not fine manifest details and return undefined", async () => {
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
        {} as Manifest
      );
      const getManifestDetailsStub = stub(
        manifest,
        "getManifestDetails"
      ).resolves(undefined);
      const wrongDocPath = __dirname;
      const project = await loader.getProject(wrongDocPath);
      expect(getProjectRootStub).to.have.been.called;
      expect(findAppRootStub).to.have.been.called;
      expect(findManifestPathStub).to.have.been.called;
      expect(getUI5ManifestStub).to.have.been.called;
      expect(getManifestDetailsStub).to.have.been.called;
      expect(project).to.be.undefined;
    });
    it("return CAP project", async () => {
      const { appRoot } = await testFramework.getProjectData();
      const docPath = join(appRoot, "ext", "main", "Main.view.xml");
      const project = await loader.getProject(docPath);
      expect(project).to.have.all.keys("type", "kind", "root", "apps");
    });
    it("return cached project", async () => {
      const getProjectSpy = spy(cache, "getProject");
      const { appRoot } = await testFramework.getProjectData();
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
      const { appRoot, projectRoot } = await testFramework.getProjectData();
      const docPath = join(appRoot, "ext", "main", "Main.view.xml");
      // for consistency remove cache
      cache.deleteProject(projectRoot);
      const project = await loader.getProject(docPath);
      expect(getProjectInfoStub).to.have.been.called;
      expect(project).to.have.all.keys("type", "root", "app");
    });
  });
});
