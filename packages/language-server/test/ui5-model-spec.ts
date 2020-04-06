import { expect } from "chai";
import { dir as tempDir, file as tempFile } from "tmp-promise";
import { readdir, mkdirs, writeFile } from "fs-extra";
import { sync as rimrafSync } from "rimraf";
import {
  getSemanticModel,
  getSemanticModelWithFetcher,
  getCacheFilePath,
  getCacheFolder
} from "../src/ui5-model";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { FetchResponse } from "../api";

describe("the UI5 language assistant ui5 model", () => {
  // The default timeout is 2000ms and getSemanticModel can take ~3000-5000ms
  const GET_MODEL_TIMEOUT = 10000;
  const VERSION = "1.71.14";

  function assertSemanticModel(ui5Model: UI5SemanticModel) {
    expect(ui5Model.version).to.equal(VERSION);

    expect(Object.keys(ui5Model.classes).length).to.be.greaterThan(200);
    expect(Object.keys(ui5Model.namespaces).length).to.be.greaterThan(200);
    expect(Object.keys(ui5Model.interfaces).length).to.be.greaterThan(30);
    expect(Object.keys(ui5Model.functions).length).to.be.greaterThan(30);
    expect(Object.keys(ui5Model.enums).length).to.be.greaterThan(200);
    expect(Object.keys(ui5Model.typedefs).length).to.be.greaterThan(10);

    expect(Object.keys(ui5Model.classes)).to.include("sap.m.List");
    expect(Object.keys(ui5Model.namespaces)).to.include("sap.m");
    expect(Object.keys(ui5Model.interfaces)).to.include("sap.f.ICard");
    expect(Object.keys(ui5Model.functions)).to.include(
      "module:sap/base/assert"
    );
    expect(Object.keys(ui5Model.enums)).to.include("sap.m.ButtonType");
    expect(Object.keys(ui5Model.typedefs)).to.include("sap.ui.fl.Selector");

    // Dist layer
    expect(Object.keys(ui5Model.classes)).to.include("sap.ui.vk.Camera");
    expect(Object.keys(ui5Model.namespaces)).to.include("sap.apf.base");
    expect(Object.keys(ui5Model.enums)).to.include(
      "sap.ca.ui.charts.ChartSelectionMode"
    );
  }

  it("will get UI5 semantic model", async () => {
    const ui5Model = await getSemanticModel(undefined);
    assertSemanticModel(ui5Model);
  }).timeout(GET_MODEL_TIMEOUT);

  it("doesn't fail if a file cannot be fetched", async () => {
    const ui5Model = await getSemanticModelWithFetcher(async (url: string) => {
      return {
        ok: false,
        json: () => {
          throw new Error(`Cannot read from ${url}`);
        }
      };
    }, undefined);
    expect(ui5Model).to.exist;
  });

  describe("with cache", () => {
    describe("cache in temp dir", () => {
      let cachePath: string;
      beforeEach(async () => {
        ({ path: cachePath } = await tempDir());
      });

      afterEach(async () => {
        // The temp folder will contain files at the end so we remove it
        // with rimraf instead of calling cleanup()
        rimrafSync(cachePath);
      });

      it("caches the model the first time getSemanticModel is called", async () => {
        const ui5Model = await getSemanticModel(cachePath);
        assertSemanticModel(ui5Model);

        // Check the files were created in the folder
        const files = await readdir(cachePath);
        expect(files.length).to.be.greaterThan(0);

        // Call getSemanticModel again with the same path and check it doesn't try to read from the URL
        let fetcherCalled = false;
        const ui5ModelFromCache = await getSemanticModelWithFetcher(
          (url: string): never => {
            fetcherCalled = true;
            throw new Error(
              `The files should be taken from the cache, got call for ${url}`
            );
          },
          cachePath
        );
        expect(fetcherCalled).to.be.false;
        // Make sure it's not the model itself that is cached
        expect(ui5ModelFromCache).to.not.equal(ui5Model);
        assertSemanticModel(ui5ModelFromCache);
      }).timeout(GET_MODEL_TIMEOUT);

      it("doesn't fail when file cannot be written to the cache", async () => {
        // Create a folder with the file name so the file will not be written
        await mkdirs(
          getCacheFilePath(getCacheFolder(cachePath, VERSION), "sap.m")
        );
        const ui5Model = await getSemanticModel(cachePath);
        expect(ui5Model).to.exist;
      }).timeout(GET_MODEL_TIMEOUT);

      it("doesn't fail when file cannot be read from the cache", async () => {
        // Create a file with non-json content so the file will not be deserialized
        const cacheFolder = getCacheFolder(cachePath, VERSION);
        await mkdirs(cacheFolder);
        await writeFile(getCacheFilePath(cacheFolder, "sap.m"), "not json");
        const ui5Model = await getSemanticModel(cachePath);
        expect(ui5Model).to.exist;
      }).timeout(GET_MODEL_TIMEOUT);
    });

    describe("cache path is a file", async () => {
      let cachePath: string;
      let cleanup: () => Promise<void>;
      beforeEach(async () => {
        ({ path: cachePath, cleanup } = await tempFile());
      });

      afterEach(async () => {
        await cleanup();
      });

      it("does not cache the model", async () => {
        const ui5Model = await getSemanticModel(cachePath);
        assertSemanticModel(ui5Model);

        // Call getSemanticModel again with the same path and check it doesn't try to read from the URL
        let fetcherCalled = false;
        await getSemanticModelWithFetcher(async (): Promise<FetchResponse> => {
          fetcherCalled = true;
          return {
            ok: true,
            json: async () => {
              return {};
            }
          };
        }, cachePath);
        expect(fetcherCalled).to.be.true;
      }).timeout(GET_MODEL_TIMEOUT);
    });
  });
});
