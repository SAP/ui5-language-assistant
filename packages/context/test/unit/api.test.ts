import * as manifest from "../../src/manifest";
import * as adpManifest from "../../src/adp-manifest";
import * as ui5Yaml from "../../src/ui5-yaml";
import * as ui5Model from "../../src/ui5-model";
import * as services from "../../src/services";
import * as viewFiles from "../../src/utils/view-files";
import * as controlIds from "../../src/utils/control-ids";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { getContext, isContext, getManifestVersion } from "../../src/api";
import { UI5_VERSION_S4_PLACEHOLDER, type Context } from "../../src/types";
import * as projectAccess from "@sap-ux/project-access";
import { OPEN_FRAMEWORK } from "@ui5-language-assistant/constant";
import { FileChangeType } from "vscode-languageserver/node";
import { cache } from "../../src/cache";
import { readFile } from "node:fs/promises";
import { URI } from "vscode-uri";

jest.mock("node:fs/promises");
jest.mock("vscode-uri");

describe("context", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("getContext", () => {
    it("get context", async () => {
      // arrange
      const getManifestDetailsStub = jest
        .spyOn(manifest, "getManifestDetails")
        .mockResolvedValue({
          appId: "",
          manifestPath: "",
          mainServicePath: "/",
          customViews: {},
          flexEnabled: false,
          minUI5Version: undefined,
        });
      const getManifestStub = jest
        .spyOn(manifest, "getUI5Manifest")
        .mockResolvedValue({
          minUI5Version: ["2.0.0", "1.126.0"],
        });
      const getMinimumUI5VersionSub = jest
        .spyOn(projectAccess, "getMinimumUI5Version")
        .mockReturnValue("1.126.0");
      const getCustomViewIdStub = jest
        .spyOn(manifest, "getCustomViewId")
        .mockResolvedValue("customViewId");
      const getYamlDetailsStub = jest
        .spyOn(ui5Yaml, "getYamlDetails")
        .mockResolvedValue({
          framework: OPEN_FRAMEWORK,
          version: undefined,
        });
      const getSemanticModelStub = jest
        .spyOn(ui5Model, "getSemanticModel")
        .mockResolvedValue({} as UI5SemanticModel);
      const getServicesStub = jest
        .spyOn(services, "getServices")
        .mockResolvedValue({});
      const finAdpdManifestPathStub = jest
        .spyOn(adpManifest, "finAdpdManifestPath")
        .mockResolvedValue("/path/to/app/variant");
      const getViewFilesStub = jest
        .spyOn(viewFiles, "getViewFiles")
        .mockResolvedValue({});
      const getControlIdsStub = jest
        .spyOn(controlIds, "getControlIds")
        .mockReturnValue(new Map());
      // act
      const result = await getContext("path/to/xml/file");
      // assert
      expect(getManifestDetailsStub).toHaveBeenCalled();
      expect(getManifestStub).toHaveBeenCalled();
      expect(getMinimumUI5VersionSub).toHaveBeenCalled();
      expect(getCustomViewIdStub).toHaveBeenCalled();
      expect(getYamlDetailsStub).toHaveBeenCalled();
      expect(getSemanticModelStub).toHaveBeenCalledWith(
        undefined,
        "OpenUI5",
        "1.126.0"
      );
      expect(getServicesStub).toHaveBeenCalled();
      expect(finAdpdManifestPathStub).toHaveBeenCalled();
      expect(getViewFilesStub).toHaveBeenCalled();
      expect(getControlIdsStub).toHaveBeenCalled();
      expect(result).toContainAllKeys([
        "services",
        "manifestDetails",
        "yamlDetails",
        "customViewId",
        "ui5Model",
        "viewFiles",
        "controlIds",
        "documentPath",
      ]);
    });
    it("get context - when minUI5Version is '${sap.ui5.dist.version}'", async () => {
      // arrange
      const getManifestDetailsStub = jest
        .spyOn(manifest, "getManifestDetails")
        .mockResolvedValue({
          appId: "",
          manifestPath: "",
          mainServicePath: "/",
          customViews: {},
          flexEnabled: false,
          minUI5Version: UI5_VERSION_S4_PLACEHOLDER,
        });
      const getManifestStub = jest
        .spyOn(manifest, "getUI5Manifest")
        .mockResolvedValue({
          minUI5Version: UI5_VERSION_S4_PLACEHOLDER,
        });
      const getMinimumUI5VersionSub = jest.spyOn(
        projectAccess,
        "getMinimumUI5Version"
      );
      const getCustomViewIdStub = jest
        .spyOn(manifest, "getCustomViewId")
        .mockResolvedValue("customViewId");
      const getYamlDetailsStub = jest
        .spyOn(ui5Yaml, "getYamlDetails")
        .mockResolvedValue({
          framework: OPEN_FRAMEWORK,
          version: undefined,
        });
      const getSemanticModelStub = jest
        .spyOn(ui5Model, "getSemanticModel")
        .mockResolvedValue({} as UI5SemanticModel);
      const getServicesStub = jest
        .spyOn(services, "getServices")
        .mockResolvedValue({});
      const finAdpdManifestPathStub = jest
        .spyOn(adpManifest, "finAdpdManifestPath")
        .mockResolvedValue("/path/to/app/variant");
      const getViewFilesStub = jest
        .spyOn(viewFiles, "getViewFiles")
        .mockResolvedValue({});
      const getControlIdsStub = jest
        .spyOn(controlIds, "getControlIds")
        .mockReturnValue(new Map());
      // act
      const result = await getContext(
        "path/to/xml/file",
        "test-model-cache-path"
      );
      // assert
      expect(getManifestDetailsStub).toHaveBeenCalled();
      expect(getManifestStub).toHaveBeenCalled();
      expect(getMinimumUI5VersionSub).not.toHaveBeenCalled();
      expect(getCustomViewIdStub).toHaveBeenCalled();
      expect(getYamlDetailsStub).toHaveBeenCalled();
      expect(getSemanticModelStub).toHaveBeenCalledWith(
        "test-model-cache-path",
        "OpenUI5",
        UI5_VERSION_S4_PLACEHOLDER
      );
      expect(getServicesStub).toHaveBeenCalled();
      expect(finAdpdManifestPathStub).toHaveBeenCalled();
      expect(getViewFilesStub).toHaveBeenCalled();
      expect(getControlIdsStub).toHaveBeenCalled();
      expect(result).toContainAllKeys([
        "services",
        "manifestDetails",
        "yamlDetails",
        "customViewId",
        "ui5Model",
        "viewFiles",
        "controlIds",
        "documentPath",
      ]);
    });
    it("throw connection error", async () => {
      const getManifestDetailsStub = jest
        .spyOn(manifest, "getManifestDetails")
        .mockResolvedValue({
          appId: "",
          manifestPath: "",
          mainServicePath: "/",
          customViews: {},
          flexEnabled: false,
          minUI5Version: undefined,
        });
      const getYamlDetailsStub = jest
        .spyOn(ui5Yaml, "getYamlDetails")
        .mockResolvedValue({
          framework: OPEN_FRAMEWORK,
          version: undefined,
        });
      const getSemanticModelStub = jest
        .spyOn(ui5Model, "getSemanticModel")
        .mockRejectedValue({
          code: "ENOTFOUND",
        });
      const result = await getContext("path/to/xml/file");
      expect(getManifestDetailsStub).toHaveBeenCalled();
      expect(getYamlDetailsStub).toHaveBeenCalled();
      expect(getSemanticModelStub).toHaveBeenCalled();
      expect(result).toContainAllKeys(["code"]);
    });
  });
  describe("isContext", () => {
    it("check true", () => {
      const result = isContext({ ui5Model: {} } as Context);
      expect(result).toBeTrue();
    });
    it("check false", () => {
      const result = isContext({ code: "ENOTFOUND" } as Error & {
        code?: string;
      });
      expect(result).toBeFalse();
    });
  });

  describe("getManifestVersion", () => {
    const mockManifestPath = "/path/to/manifest.json";
    const mockManifestUri = `file://${mockManifestPath}`;

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it("should return empty versions when changeType is Deleted", async () => {
      // act
      const result = await getManifestVersion({
        manifestUri: mockManifestUri,
        changeType: FileChangeType.Deleted,
      });

      // assert
      expect(result).toEqual({
        oldVersion: "",
        newVersion: "",
        changed: false,
      });
      expect(readFile).not.toHaveBeenCalled();
    });

    it("should detect version change when manifest version is updated", async () => {
      // arrange
      const oldManifest = { _version: "1.0.0" };
      const newManifest = { _version: "1.1.0" };

      jest
        .spyOn(URI, "parse")
        .mockReturnValue({ fsPath: mockManifestPath } as ReturnType<
          typeof URI.parse
        >);
      jest
        .spyOn(cache, "getManifest")
        .mockReturnValue(oldManifest as { _version: string });
      (readFile as jest.Mock).mockResolvedValue(JSON.stringify(newManifest));

      // act
      const result = await getManifestVersion({
        manifestUri: mockManifestUri,
        changeType: FileChangeType.Changed,
      });

      // assert
      expect(URI.parse).toHaveBeenCalledWith(mockManifestUri);
      expect(cache.getManifest).toHaveBeenCalledWith(mockManifestPath);
      expect(readFile).toHaveBeenCalledWith(mockManifestPath, "utf-8");
      expect(result).toEqual({
        oldVersion: "1.0.0",
        newVersion: "1.1.0",
        changed: true,
      });
    });

    it("should return changed: false when versions are the same", async () => {
      // arrange
      const oldManifest = { _version: "1.0.0" };
      const newManifest = { _version: "1.0.0" };

      jest
        .spyOn(URI, "parse")
        .mockReturnValue({ fsPath: mockManifestPath } as ReturnType<
          typeof URI.parse
        >);
      jest
        .spyOn(cache, "getManifest")
        .mockReturnValue(oldManifest as { _version: string });
      (readFile as jest.Mock).mockResolvedValue(JSON.stringify(newManifest));

      // act
      const result = await getManifestVersion({
        manifestUri: mockManifestUri,
        changeType: FileChangeType.Changed,
      });

      // assert
      expect(result).toEqual({
        oldVersion: "1.0.0",
        newVersion: "1.0.0",
        changed: false,
      });
    });

    it("should return empty versions on file read error", async () => {
      // arrange
      jest
        .spyOn(URI, "parse")
        .mockReturnValue({ fsPath: mockManifestPath } as ReturnType<
          typeof URI.parse
        >);
      jest
        .spyOn(cache, "getManifest")
        .mockReturnValue({ _version: "1.0.0" } as { _version: string });
      (readFile as jest.Mock).mockRejectedValue(new Error("File not found"));

      // act
      const result = await getManifestVersion({
        manifestUri: mockManifestUri,
        changeType: FileChangeType.Changed,
      });

      // assert
      expect(result).toEqual({
        oldVersion: "",
        newVersion: "",
        changed: false,
      });
    });
  });
});
