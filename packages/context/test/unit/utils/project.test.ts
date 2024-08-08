import { join } from "path";
import { homedir } from "os";
import {
  findAppRoot,
  getLocalAnnotationsForService,
  getLocalMetadataForService,
  getProjectInfo,
  getProjectRoot,
  unifyServicePath,
  getWebappPath,
} from "../../../src/utils/project";
import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
} from "@ui5-language-assistant/test-framework";
import { getProjectData } from "../utils";
import * as pa from "@sap-ux/project-access";

describe("project", () => {
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
  }, 5 * 60000);
  describe("getProjectRoot", () => {
    it("return undefined when no package.json is found", async () => {
      const result = await getProjectRoot(homedir());
      expect(result).toBeUndefined();
    });
    it("return project root ", async () => {
      const projectRoot = testFramework.getProjectRoot();
      const { appRoot } = await getProjectData(projectRoot);
      const docPath = join(appRoot, "ext", "main", "Main.view.xml");
      const result = await getProjectRoot(docPath);
      expect(result).toEqual(projectRoot);
    });
    it("free style project", async () => {
      const framework = new TestFramework({
        projectInfo: {
          name: ProjectName.tsFreeStyle,
          type: ProjectType.UI5,
          npmInstall: false,
        },
      });
      const projectRoot = framework.getProjectRoot();
      const documentPath = join(projectRoot, "src", "view", "Main.view.xml");
      const result = await getProjectRoot(documentPath);
      expect(result).toEqual(projectRoot);
    });
  });
  describe("getProjectInfo", () => {
    it("undefined", async () => {
      const result = await getProjectInfo("/");
      expect(result).toBeUndefined();
    });
    it("NodeJS", async () => {
      const projectRoot = testFramework.getProjectRoot();
      const result = await getProjectInfo(projectRoot);
      expect(result).toEqual({ type: "CAP", kind: "NodeJS" });
    });
    it("Java", async () => {
      const projectRoot = testFramework.getProjectRoot();
      const isCapNodeSpy = jest
        .spyOn(pa, "isCapNodeJsProject")
        .mockReturnValue(false);
      const isCapJavaSpy = jest
        .spyOn(pa, "isCapJavaProject")
        .mockResolvedValue(true);
      try {
        const result = await getProjectInfo(projectRoot);
        expect(result).toEqual({ type: "CAP", kind: "Java" });
      } finally {
        isCapJavaSpy.mockRestore();
        isCapNodeSpy.mockRestore();
      }
    });
    it("UI5", async () => {
      const projectRoot = testFramework.getProjectRoot();
      const isCapNodeSpy = jest
        .spyOn(pa, "isCapNodeJsProject")
        .mockReturnValue(false);
      try {
        const result = await getProjectInfo(projectRoot);
        expect(result).toEqual({ type: "UI5", kind: "UI5" });
      } finally {
        isCapNodeSpy.mockRestore();
      }
    });
  });
  describe("findAppRoot", () => {
    it("return app root", async () => {
      const { appRoot } = await getProjectData(testFramework.getProjectRoot());
      const docPath = join(appRoot, "ext", "main", "Main.view.xml");
      const result = await findAppRoot(docPath);
      expect(result).toEqual(appRoot);
    });
    it("return undefined", async () => {
      const result = await findAppRoot(__dirname);
      expect(result).toBeUndefined();
    });
  });
  describe("getLocalAnnotationsForService", () => {
    it("get local annotation files", async () => {
      const { appRoot, manifest } = await getProjectData(
        testFramework.getProjectRoot()
      );
      const result = await getLocalAnnotationsForService(
        manifest,
        "mainService",
        appRoot
      );
      expect(result).toHaveLength(1);
    });
    it("return empty", async () => {
      const { appRoot, manifest } = await getProjectData(
        testFramework.getProjectRoot()
      );
      const result = await getLocalAnnotationsForService(
        manifest,
        "wrongServiceName",
        appRoot
      );
      expect(result).toHaveLength(0);
    });
    it("return empty when internal exception is thrown", async () => {
      const { appRoot, manifest } = await getProjectData(
        testFramework.getProjectRoot()
      );
      const mock = (await import("mock-fs")).default;
      try {
        mock({});
        const result = await getLocalAnnotationsForService(
          manifest,
          "mainService",
          appRoot
        );
        expect(result).toHaveLength(0);
      } finally {
        mock.restore();
      }
    });
  });
  describe("getLocalMetadataForService", () => {
    it("get local metadata file", async () => {
      const { appRoot, manifest } = await getProjectData(
        testFramework.getProjectRoot()
      );
      const result = await getLocalMetadataForService(
        manifest,
        "mainService",
        appRoot
      );
      expect(result).toBeString();
    });
    it("return undefined", async () => {
      const { appRoot, manifest } = await getProjectData(
        testFramework.getProjectRoot()
      );
      const result = await getLocalMetadataForService(
        manifest,
        "wrongServiceName",
        appRoot
      );
      expect(result).toBeUndefined();
    });
    it("return empty when internal exception is thrown", async () => {
      const { appRoot, manifest } = await getProjectData(
        testFramework.getProjectRoot()
      );
      const mock = (await import("mock-fs")).default;
      try {
        mock({});
        const result = await getLocalMetadataForService(
          manifest,
          "mainService",
          appRoot
        );
        expect(result).toBeUndefined();
      } finally {
        mock.restore();
      }
    });
  });
  describe("unifyServicePath", () => {
    it("add forward slash at beginning", () => {
      const servicePath = "processor/";
      const result = unifyServicePath(servicePath);
      expect(result).toEqual("/processor/");
    });
    it("add forward slash at beginning - multi segments", () => {
      const servicePath = "processor/one/two/";
      const result = unifyServicePath(servicePath);
      expect(result).toEqual("/processor/one/two/");
    });
    it("add forward slash at end", () => {
      const servicePath = "/processor";
      const result = unifyServicePath(servicePath);
      expect(result).toEqual("/processor/");
    });
    it("add forward slash at end - multi segments", () => {
      const servicePath = "/processor/one/two";
      const result = unifyServicePath(servicePath);
      expect(result).toEqual("/processor/one/two/");
    });
  });
  describe("getWebappPath", () => {
    it("webapp exists in file uri", () => {
      // arrange
      const uri = join(
        "root",
        "project",
        "webapp",
        "ext",
        "my-test-file.view.xml"
      );
      // act
      const result = getWebappPath(uri);
      // assert
      expect(join("root", "project", "webapp")).toStrictEqual(result);
    });
    it("webapp does not exist in file uri", () => {
      // arrange
      const uri = join("root", "project", "ext", "my-test-file.view.xml");
      // act
      const result = getWebappPath(uri);
      // assert
      expect("webapp").toStrictEqual(result);
    });
  });
});
