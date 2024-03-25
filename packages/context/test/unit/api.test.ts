import * as manifest from "../../src/manifest";
import * as ui5Yaml from "../../src/ui5-yaml";
import * as ui5Model from "../../src/ui5-model";
import * as services from "../../src/services";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { getContext, isContext } from "../../src/api";
import type { Context } from "../../src/types";

describe("context", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("getContext", () => {
    it("get context", async () => {
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
      const getCustomViewIdStub = jest
        .spyOn(manifest, "getCustomViewId")
        .mockResolvedValue("customViewId");
      const getYamlDetailsStub = jest
        .spyOn(ui5Yaml, "getYamlDetails")
        .mockResolvedValue({
          framework: "OpenUI5",
          version: undefined,
        });
      const getSemanticModelStub = jest
        .spyOn(ui5Model, "getSemanticModel")
        .mockResolvedValue({} as UI5SemanticModel);
      const getServicesStub = jest
        .spyOn(services, "getServices")
        .mockResolvedValue({});
      const result = await getContext("path/to/xml/file");
      expect(getManifestDetailsStub).toHaveBeenCalled();
      expect(getCustomViewIdStub).toHaveBeenCalled();
      expect(getYamlDetailsStub).toHaveBeenCalled();
      expect(getSemanticModelStub).toHaveBeenCalled();
      expect(getServicesStub).toHaveBeenCalled();
      expect(result).toContainAllKeys([
        "services",
        "manifestDetails",
        "yamlDetails",
        "customViewId",
        "ui5Model",
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
          framework: "OpenUI5",
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
});
