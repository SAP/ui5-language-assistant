import { cache } from "../../src/cache";
import { fileURLToPath } from "url";
import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
} from "@ui5-language-assistant/test-framework";
import * as loader from "../../src/loader";
import {
  reactOnCdsFileChange,
  reactOnManifestChange,
  reactOnPackageJson,
  reactOnUI5YamlChange,
  reactOnXmlFileChange,
} from "../../src/watcher";
import { CAPProject, Project, YamlDetails } from "../../src/types";
import * as utils from "../../src/utils";
import * as manifest from "../../src/manifest";
import { URI } from "vscode-uri";
import pathParse from "path-parse";
import {
  DEFAULT_UI5_FRAMEWORK,
  OPEN_FRAMEWORK,
} from "@ui5-language-assistant/constant";

describe("watcher", () => {
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

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("reactOnManifestChange", () => {
    const setManifestSpy = jest.spyOn(cache, "setManifest");
    const deleteManifestSpy = jest.spyOn(cache, "deleteManifest");
    const deleteAppSpy = jest.spyOn(cache, "deleteApp");
    const setAppSpy = jest.spyOn(cache, "setApp");
    const deleteProjectSpy = jest.spyOn(cache, "deleteProject");
    const setProjectSpy = jest.spyOn(cache, "setProject");
    const getProjectSpy = jest.spyOn(loader, "getProject");

    let manifestUri;
    beforeAll(() => {
      manifestUri = testFramework.getFileUri([
        "app",
        "manage_travels",
        "webapp",
        "manifest.json",
      ]);
    });

    beforeEach(() => {
      // reset cache for consistency
      cache.reset();
      jest.resetAllMocks();
      jest.clearAllMocks();
    });

    it("reactOnManifestChange - CAP project", async () => {
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
      jest.resetAllMocks();
      await reactOnManifestChange(manifestUri, 1);
      const projectRoot = fileURLToPath(testFramework.getFileUri([]));
      const cachedProject = cache.getProject(projectRoot) as CAPProject;

      expect(deleteManifestSpy).toHaveBeenCalledOnce();
      expect(setManifestSpy).toHaveBeenCalledOnce();
      expect(deleteAppSpy).toHaveBeenCalledOnce();
      expect(setAppSpy).toHaveBeenCalledOnce();
      expect(deleteProjectSpy).toHaveBeenCalledOnce();
      expect(setProjectSpy).toHaveBeenCalledOnce();
      expect(getProjectSpy).toHaveBeenCalledOnce();
      expect(cachedProject.apps.size).toEqual(1);
    });

    describe("edge cases", () => {
      it("no project root", async () => {
        const getPRootSpy = jest
          .spyOn(utils, "getProjectRoot")
          .mockResolvedValue(undefined);
        try {
          await reactOnManifestChange(manifestUri, 1);
          expect(deleteManifestSpy).not.toHaveBeenCalled();
        } finally {
          getPRootSpy.mockRestore();
        }
      });

      it("no cached project", async () => {
        const cacheGetProjectSpy = jest
          .spyOn(cache, "getProject")
          .mockReturnValue(undefined);
        try {
          await reactOnManifestChange(manifestUri, 1);
          expect(deleteManifestSpy).toHaveBeenCalledOnce();
          expect(deleteProjectSpy).not.toHaveBeenCalled();
        } finally {
          cacheGetProjectSpy.mockRestore();
        }
      });

      it("cached project type is UI5", async () => {
        const cacheGetProjectSpy = jest
          .spyOn(cache, "getProject")
          .mockReturnValue({ type: "UI5" } as unknown as Project);
        try {
          await reactOnManifestChange(manifestUri, 1);
          expect(deleteAppSpy).toHaveBeenCalledOnce();
        } finally {
          cacheGetProjectSpy.mockRestore();
        }
      });
    });
  });

  describe("reactOnUI5YamlChange", () => {
    describe("test create or change operation", () => {
      let fileUri: string;
      let yamlPath: string;
      let directory: string;
      let setYamlDetailsSpy: jest.SpyInstance<
        void,
        [documentPath: string, data: YamlDetails]
      >;

      beforeAll(() => {
        fileUri = testFramework.getFileUri([
          "app",
          "manage_travels",
          "ui5.yaml",
        ]);
        yamlPath = URI.parse(fileUri).fsPath;
        directory = pathParse(yamlPath).dir;
      });

      beforeEach(() => {
        // reset cache for consistency
        cache.reset();
        setYamlDetailsSpy = jest.spyOn(cache, "setYamlDetails");
      });

      afterEach(() => setYamlDetailsSpy.mockReset());
      afterAll(() => setYamlDetailsSpy.mockRestore());

      it("read file without framework version", async () => {
        await reactOnUI5YamlChange(fileUri, 1);
        expect(setYamlDetailsSpy).toHaveBeenCalledOnce();
        expect(setYamlDetailsSpy.mock.calls[0]).toEqual([
          yamlPath,
          {
            framework: DEFAULT_UI5_FRAMEWORK,
            version: undefined,
          },
        ]);
      });

      it("file with OpenUI5 framework config", async () => {
        const mock = (await import("mock-fs")).default;
        try {
          mock({
            [directory]: {
              ["ui5.yaml"]: `
          framework:
            name: OpenUI5
          `,
            },
          });
          await reactOnUI5YamlChange(fileUri, 1);
          expect(setYamlDetailsSpy).toHaveBeenCalledTimes(2);
          expect(setYamlDetailsSpy.mock.calls[1]).toEqual([
            yamlPath,
            {
              framework: OPEN_FRAMEWORK,
              version: undefined,
            },
          ]);
        } finally {
          mock.restore();
        }
      });

      it("file with SAPUI5 framework config", async () => {
        const mock = (await import("mock-fs")).default;
        try {
          mock({
            [directory]: {
              ["ui5.yaml"]: `
          framework:
            name: ${DEFAULT_UI5_FRAMEWORK}
            version: "1.100.0"
          `,
            },
          });
          await reactOnUI5YamlChange(fileUri, 1);
          expect(setYamlDetailsSpy).toHaveBeenCalledTimes(2);
          expect(setYamlDetailsSpy.mock.calls[1]).toEqual([
            yamlPath,
            {
              framework: DEFAULT_UI5_FRAMEWORK,
              version: "1.100.0",
            },
          ]);
        } finally {
          mock.restore();
        }
      });
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
      const deleteYamlDetailsSpy = jest.spyOn(cache, "deleteYamlDetails");
      await reactOnUI5YamlChange(fileUri, 3);

      expect(deleteYamlDetailsSpy).toHaveBeenCalledOnce();
    });
  });

  describe("reactOnCdsFileChange", () => {
    const deleteCapServicesSpy = jest.spyOn(cache, "deleteCAPServices");
    const setCapServicesSpy = jest.spyOn(cache, "setCAPServices");
    const deleteAppSpy = jest.spyOn(cache, "deleteApp");
    const setAppSpy = jest.spyOn(cache, "setApp");

    let fileUri, documentPath, cdsUri;
    beforeAll(() => {
      // creating file uri and file path to have same key
      // On windows, `C` drive is convert to lower case when getting file uri
      fileUri = testFramework.getFileUri([
        "app",
        "manage_travels",
        "webapp",
        "ext",
        "main",
        "Main.view.xml",
      ]);
      documentPath = URI.parse(fileUri).fsPath;
      cdsUri = testFramework.getFileUri([
        "app",
        "manage_travels",
        "annotations.cds",
      ]);
    });

    const loadProject = async () => {
      await loader.getProject(documentPath);
      jest.resetAllMocks();
    };

    beforeEach(() => {
      // reset cache for consistency
      cache.reset();
      jest.resetAllMocks();
    });

    it("single cds file", async () => {
      // first create all caches
      await loadProject();
      await reactOnCdsFileChange([{ uri: cdsUri, type: 1 }]);
      const projectRoot = fileURLToPath(testFramework.getFileUri([]));
      const cachedProject = cache.getProject(projectRoot) as CAPProject;

      expect(deleteCapServicesSpy).toHaveBeenCalledOnce();
      expect(setCapServicesSpy).toHaveBeenCalledOnce();
      expect(deleteAppSpy).toHaveBeenCalledOnce();
      expect(setAppSpy).toHaveBeenCalledOnce();
      expect(cachedProject.apps.size).toEqual(1);
    });

    it("two or more cds files - only one time recompilation and procession for same project root", async () => {
      // first create all caches
      await loadProject();
      const cdsUri02 = testFramework.getFileUri(["app", "labels.cds"]);
      await reactOnCdsFileChange([
        { uri: cdsUri, type: 1 },
        { uri: cdsUri02, type: 1 },
      ]);
      const projectRoot = fileURLToPath(testFramework.getFileUri([]));
      const cachedProject = cache.getProject(projectRoot) as CAPProject;

      expect(deleteCapServicesSpy).toHaveBeenCalledOnce();
      expect(setCapServicesSpy).toHaveBeenCalledOnce();
      expect(deleteAppSpy).toHaveBeenCalledOnce();
      expect(setAppSpy).toHaveBeenCalledOnce();
      expect(cachedProject.apps.size).toEqual(1);
    });

    describe("edge cases", () => {
      const getUI5ManifestSpy = jest.spyOn(manifest, "getUI5Manifest");
      const getProjectInfoSpy = jest.spyOn(utils, "getProjectInfo");
      const getAppSpy = jest.spyOn(loader, "getApp");

      it("no project root", async () => {
        const getPRootSpy = jest
          .spyOn(utils, "getProjectRoot")
          .mockResolvedValue(undefined);
        try {
          await reactOnCdsFileChange([{ uri: cdsUri, type: 1 }]);
          expect(deleteCapServicesSpy).not.toHaveBeenCalled();
        } finally {
          getPRootSpy.mockRestore();
        }
      });

      it("no cached project", async () => {
        const cacheGetProjectSpy = jest
          .spyOn(cache, "getProject")
          .mockReturnValue(undefined);
        try {
          await reactOnCdsFileChange([{ uri: cdsUri, type: 1 }]);
          expect(getUI5ManifestSpy).not.toHaveBeenCalled();
        } finally {
          cacheGetProjectSpy.mockRestore();
        }
      });

      it("cached project type is not CDS", async () => {
        const cacheGetProjectSpy = jest
          .spyOn(cache, "getProject")
          .mockReturnValue({ type: "UI5" } as unknown as Project);
        try {
          await reactOnCdsFileChange([{ uri: cdsUri, type: 1 }]);
          expect(getUI5ManifestSpy).not.toHaveBeenCalled();
        } finally {
          cacheGetProjectSpy.mockRestore();
        }
      });

      it("no ui5 manifest", async () => {
        await loadProject();
        getUI5ManifestSpy.mockResolvedValue(undefined);
        try {
          await reactOnCdsFileChange([{ uri: cdsUri, type: 1 }]);
          expect(getProjectInfoSpy).not.toHaveBeenCalled();
        } finally {
          getUI5ManifestSpy.mockRestore();
        }
      });

      it("no project info", async () => {
        await loadProject();
        getProjectInfoSpy.mockResolvedValue(undefined);
        try {
          await reactOnCdsFileChange([{ uri: cdsUri, type: 1 }]);
          expect(deleteAppSpy).not.toHaveBeenCalled();
        } finally {
          getProjectInfoSpy.mockRestore();
        }
      });

      it("no app", async () => {
        await loadProject();
        getAppSpy.mockResolvedValue(undefined);
        try {
          await reactOnCdsFileChange([{ uri: cdsUri, type: 1 }]);
          expect(cache.getAppEntries()).toBeEmpty();
        } finally {
          getAppSpy.mockRestore();
        }
      });
    });
  });

  describe("reactOnXmlFileChange", () => {
    const deleteAppSpy = jest.spyOn(cache, "deleteApp");
    const setAppSpy = jest.spyOn(cache, "setApp");
    const deleteProjectSpy = jest.spyOn(cache, "deleteProject");
    const setProjectSpy = jest.spyOn(cache, "setProject");
    const getProjectSpy = jest.spyOn(loader, "getProject");
    const setViewFilesSpy = jest.spyOn(cache, "setViewFiles");

    let fileUri, documentPath;

    beforeAll(() => {
      fileUri = testFramework.getFileUri([
        "app",
        "manage_travels",
        "webapp",
        "annotations",
        "annotation.xml",
      ]);
      documentPath = URI.parse(fileUri).fsPath;
    });

    beforeEach(() => {
      // reset cache for consistency
      cache.reset();
      jest.resetAllMocks();
    });

    it("test unregistered xml file", async () => {
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
      const deleteAppSpy = jest.spyOn(cache, "deleteApp");
      await reactOnXmlFileChange(fileUri, 1);

      expect(deleteAppSpy).not.toHaveBeenCalledOnce();
      expect(setViewFilesSpy).toHaveBeenCalledOnce();
    });

    it("test registered xml file", async () => {
      // first create all caches
      await loader.getProject(documentPath);
      jest.resetAllMocks();
      await reactOnXmlFileChange(fileUri, 1);
      const projectRoot = fileURLToPath(testFramework.getFileUri([]));
      const cachedProject = cache.getProject(projectRoot) as CAPProject;

      expect(deleteAppSpy).toHaveBeenCalledOnce();
      expect(setAppSpy).toHaveBeenCalledOnce();
      expect(deleteProjectSpy).toHaveBeenCalledOnce();
      expect(setProjectSpy).toHaveBeenCalledOnce();
      expect(getProjectSpy).toHaveBeenCalledOnce();
      expect(cachedProject.apps.size).toEqual(1);
    });

    it("test registered metadata xml file", async () => {
      fileUri = testFramework.getFileUri([
        "app",
        "manage_travels",
        "webapp",
        "localService",
        "metadata.xml",
      ]);
      documentPath = URI.parse(fileUri).fsPath;
      // first create all caches
      await loader.getProject(documentPath);
      jest.resetAllMocks();
      await reactOnXmlFileChange(fileUri, 1);
      const projectRoot = fileURLToPath(testFramework.getFileUri([]));
      const cachedProject = cache.getProject(projectRoot) as CAPProject;

      expect(deleteAppSpy).toHaveBeenCalledOnce();
      expect(setAppSpy).toHaveBeenCalledOnce();
      expect(deleteProjectSpy).toHaveBeenCalledOnce();
      expect(setProjectSpy).toHaveBeenCalledOnce();
      expect(getProjectSpy).toHaveBeenCalledOnce();
      expect(cachedProject.apps.size).toEqual(1);
    });

    describe("edge cases", () => {
      beforeEach(() => {
        cache.reset();
        jest.resetAllMocks();
      });

      it("edge case - no project root", async () => {
        const findManifestSpy = jest
          .spyOn(manifest, "findManifestPath")
          .mockResolvedValue(undefined);
        const getManifestSpy = jest.spyOn(manifest, "getUI5Manifest");
        try {
          await reactOnXmlFileChange(fileUri, 1);
          expect(getManifestSpy).not.toHaveBeenCalled();
        } finally {
          findManifestSpy.mockRestore();
        }
      });

      it("edge case - no manifest", async () => {
        const getManifestSpy = jest
          .spyOn(manifest, "getUI5Manifest")
          .mockResolvedValue(undefined);
        const getPRootSpy = jest.spyOn(utils, "getProjectRoot");
        try {
          await reactOnXmlFileChange(fileUri, 1);
          expect(getPRootSpy).not.toHaveBeenCalled();
        } finally {
          getManifestSpy.mockRestore();
        }
      });

      it("edge case - no project root", async () => {
        const findAppRootSpy = jest.spyOn(utils, "findAppRoot");
        const getPRootSpy = jest
          .spyOn(utils, "getProjectRoot")
          .mockResolvedValue(undefined);
        try {
          await reactOnXmlFileChange(fileUri, 1);
          expect(findAppRootSpy).not.toHaveBeenCalled();
        } finally {
          getPRootSpy.mockRestore();
        }
      });

      it("edge case - no app root", async () => {
        const findAppRootSpy = jest
          .spyOn(utils, "findAppRoot")
          .mockResolvedValue(undefined);
        try {
          await reactOnXmlFileChange(fileUri, 1);
          expect(deleteAppSpy).not.toHaveBeenCalled();
        } finally {
          findAppRootSpy.mockRestore();
        }
      });
    });
  });

  describe("reactOnPackageJson", () => {
    const deleteAppSpy = jest.spyOn(cache, "deleteApp");
    const deleteProjectSpy = jest.spyOn(cache, "deleteProject");
    const deleteCapServicesSpy = jest.spyOn(cache, "deleteCAPServices");

    let fileUri, packageJSONUri, documentPath;
    beforeAll(() => {
      fileUri = testFramework.getFileUri([
        "app",
        "manage_travels",
        "webapp",
        "ext",
        "main",
        "Main.view.xml",
      ]);
      packageJSONUri = testFramework.getFileUri(["package.json"]);
      // On windows, `C` drive is convert to lower case when getting file uri
      documentPath = URI.parse(fileUri).fsPath;
    });

    beforeEach(() => {
      // reset cache for consistency
      cache.reset();
      jest.resetAllMocks();
    });

    it("reactOnPackageJson - CAP", async () => {
      // creating file uri and file path to have same key
      // first create all caches
      await loader.getProject(documentPath);
      jest.resetAllMocks();
      await reactOnPackageJson(packageJSONUri, 1);
      const projectRoot = fileURLToPath(testFramework.getFileUri([]));
      const cachedProject = cache.getProject(projectRoot) as CAPProject;

      expect(deleteCapServicesSpy).toHaveBeenCalledOnce();
      expect(deleteAppSpy).toHaveBeenCalledOnce();
      expect(deleteProjectSpy).toHaveBeenCalledOnce();
      expect(cachedProject).toBeUndefined();
    });

    it("reactOnPackageJson edge case - no project root", async () => {
      jest.spyOn(utils, "getProjectRoot").mockResolvedValue("");
      const cacheSpy = jest.spyOn(cache, "getProject");
      try {
        await reactOnPackageJson(packageJSONUri, 1);
        expect(cacheSpy).not.toHaveBeenCalled();
      } finally {
        cacheSpy.mockRestore();
      }
    });

    it("reactOnPackageJson edge case - no cached project", async () => {
      // first create all caches
      await loader.getProject(documentPath);
      jest.resetAllMocks();
      const cacheSpy = jest
        .spyOn(cache, "getProject")
        .mockReturnValue(undefined);
      try {
        await reactOnPackageJson(packageJSONUri, 1);
        expect(deleteCapServicesSpy).not.toHaveBeenCalled();
      } finally {
        cacheSpy.mockRestore();
      }
    });
  });
});
