import { expect } from "chai";
import { join } from "path";
import {
  findAppRoot,
  getLocalAnnotationsForService,
  getLocalMetadataForService,
  getProjectInfo,
  getProjectRoot,
  unifyServicePath,
} from "../../src/utils/project";
import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
} from "@ui5-language-assistant/test-framework";

describe("project", () => {
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
  context("getProjectRoot", () => {
    it("throws exception and return undefined", async () => {
      const result = await getProjectRoot(__dirname);
      expect(result).to.be.undefined;
    });
    it("return project root ", async () => {
      const { appRoot, projectRoot } = await testFramework.getProjectData();
      const docPath = join(appRoot, "ext", "main", "Main.view.xml");
      const result = await getProjectRoot(docPath);
      expect(result).to.equal(projectRoot);
    });
  });
  context("getProjectInfo", () => {
    it("undefined", async () => {
      const result = await getProjectInfo("/");
      expect(result).to.be.undefined;
    });
    it("NodeJS", async () => {
      const { projectRoot } = await testFramework.getProjectData();
      const result = await getProjectInfo(projectRoot);
      expect(result).to.deep.equal({ type: "CAP", kind: "NodeJS" });
    });
  });
  context("findAppRoot", () => {
    it("return app root", async () => {
      const { appRoot } = await testFramework.getProjectData();
      const docPath = join(appRoot, "ext", "main", "Main.view.xml");
      const result = await findAppRoot(docPath);
      expect(result).to.equal(appRoot);
    });
    it("return undefined", async () => {
      const result = await findAppRoot(__dirname);
      expect(result).to.be.undefined;
    });
  });
  context("getLocalAnnotationsForService", () => {
    it("get local annotation files", async () => {
      const { appRoot, manifest } = await testFramework.getProjectData();
      const result = await getLocalAnnotationsForService(
        manifest,
        "mainService",
        appRoot
      );
      expect(result).to.have.length(1);
    });
    it("return undefined", async () => {
      const { appRoot, manifest } = await testFramework.getProjectData();
      const result = await getLocalAnnotationsForService(
        manifest,
        "wrongServiceName",
        appRoot
      );
      expect(result).to.have.length(0);
    });
  });
  context("getLocalMetadataForService", () => {
    it("get local metadata file", async () => {
      const { appRoot, manifest } = await testFramework.getProjectData();
      const result = await getLocalMetadataForService(
        manifest,
        "mainService",
        appRoot
      );
      expect(result).to.have.string;
    });
    it("return undefined", async () => {
      const { appRoot, manifest } = await testFramework.getProjectData();
      const result = await getLocalMetadataForService(
        manifest,
        "wrongServiceName",
        appRoot
      );
      expect(result).to.be.undefined;
    });
  });
  context("unifyServicePath", () => {
    it("add forward slash at beginning", () => {
      const servicePath = "processor/";
      const result = unifyServicePath(servicePath);
      expect(result).to.be.equal("/processor/");
    });
    it("add forward slash at beginning - multi segments", () => {
      const servicePath = "processor/one/two/";
      const result = unifyServicePath(servicePath);
      expect(result).to.be.equal("/processor/one/two/");
    });
    it("add forward slash at end", () => {
      const servicePath = "/processor";
      const result = unifyServicePath(servicePath);
      expect(result).to.be.equal("/processor/");
    });
    it("add forward slash at end - multi segments", () => {
      const servicePath = "/processor/one/two";
      const result = unifyServicePath(servicePath);
      expect(result).to.be.equal("/processor/one/two/");
    });
  });
});
