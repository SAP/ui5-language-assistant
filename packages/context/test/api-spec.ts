import { expect } from "chai";
import { restore, stub } from "sinon";
import * as manifest from "../src/manifest";
import * as ui5Yaml from "../src/ui5-yaml";
import * as ui5Model from "../src/ui5-model";
import * as services from "../src/services";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { getContext } from "../src/api";

describe("context", () => {
  afterEach(() => {
    restore();
  });
  context("getContext", () => {
    it("get context", async () => {
      const getManifestDetailsStub = stub(
        manifest,
        "getManifestDetails"
      ).resolves({
        mainServicePath: "/",
        customViews: {},
        flexEnabled: false,
        minUI5Version: undefined,
      });
      const getCustomViewIdStub = stub(manifest, "getCustomViewId").resolves(
        "customViewId"
      );
      const getYamlDetailsStub = stub(ui5Yaml, "getYamlDetails").resolves({
        framework: "OpenUI5",
        version: undefined,
      });
      const getSemanticModelStub = stub(ui5Model, "getSemanticModel").resolves(
        {} as UI5SemanticModel
      );
      const getServicesStub = stub(services, "getServices").resolves({});
      const result = await getContext("path/to/xml/file");
      expect(getManifestDetailsStub).to.have.been.called;
      expect(getCustomViewIdStub).to.have.been.called;
      expect(getYamlDetailsStub).to.have.been.called;
      expect(getSemanticModelStub).to.have.been.called;
      expect(getServicesStub).to.have.been.called;
      expect(result).to.have.all.keys(
        "services",
        "manifestDetails",
        "yamlDetails",
        "customViewId",
        "ui5Model"
      );
    });
  });
});
