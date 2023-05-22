import { dir as tempDir, file as tempFile } from "tmp-promise";
import { readdir, mkdirs, writeFile } from "fs-extra";
import { sync as rimrafSync } from "rimraf";
import { forEach, isPlainObject } from "lodash";

import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { expectExists } from "@ui5-language-assistant/test-utils";
import {
  getSemanticModel,
  getSemanticModelWithFetcher,
  getCacheFilePath,
  getCacheFolder,
  negotiateVersionWithFetcher,
} from "../../src/ui5-model";
import { FetchResponse } from "@ui5-language-assistant/language-server";

describe("the UI5 language assistant ui5 model", () => {
  // The default timeout is 2000ms and getSemanticModel can take ~3000-5000ms
  const GET_MODEL_TIMEOUT = 20000;
  const FRAMEWORK = "SAPUI5";
  const OPEN_FRAMEWORK = "OpenUI5";
  const VERSION = "1.71.49";
  const NO_CACHE_FOLDER = undefined;

  function assertSemanticModel(ui5Model: UI5SemanticModel): void {
    expect(ui5Model.version).toEqual(VERSION);

    expect(Object.keys(ui5Model.classes).length).toBeGreaterThan(200);
    expect(Object.keys(ui5Model.namespaces).length).toBeGreaterThan(200);
    expect(Object.keys(ui5Model.interfaces).length).toBeGreaterThan(30);
    expect(Object.keys(ui5Model.functions).length).toBeGreaterThan(30);
    expect(Object.keys(ui5Model.enums).length).toBeGreaterThan(200);
    expect(Object.keys(ui5Model.typedefs).length).toBeGreaterThan(10);

    expect(Object.keys(ui5Model.classes)).toInclude("sap.m.List");
    expect(Object.keys(ui5Model.namespaces)).toInclude("sap.m");
    expect(Object.keys(ui5Model.interfaces)).toInclude("sap.f.ICard");
    expect(Object.keys(ui5Model.functions)).toInclude("module:sap/base/assert");
    expect(Object.keys(ui5Model.enums)).toInclude("sap.m.ButtonType");
    expect(Object.keys(ui5Model.typedefs)).toInclude("sap.ui.fl.Selector");

    // Dist layer
    expect(Object.keys(ui5Model.classes)).toInclude("sap.ui.vk.Camera");
    expect(Object.keys(ui5Model.namespaces)).toInclude("sap.apf.base");
    expect(Object.keys(ui5Model.enums)).toInclude(
      "sap.ca.ui.charts.ChartSelectionMode"
    );
  }

  it(
    "will get UI5 semantic model",
    async () => {
      const ui5Model = await getSemanticModel(
        NO_CACHE_FOLDER,
        FRAMEWORK,
        undefined,
        true
      );
      assertSemanticModel(ui5Model);
    },
    GET_MODEL_TIMEOUT
  );

  it("doesn't fail if a file cannot be fetched", async () => {
    const ui5Model = await getSemanticModelWithFetcher(
      async (url: string) => {
        return {
          ok: false,
          status: 500,
          json: (): never => {
            throw new Error(`Cannot read from ${url}`);
          },
        };
      },
      NO_CACHE_FOLDER,
      FRAMEWORK,
      undefined,
      true
    );
    expect(ui5Model).not.toBeUndefined();
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

      it(
        "caches the model the first time getSemanticModel is called",
        async () => {
          const ui5Model = await getSemanticModel(
            cachePath,
            FRAMEWORK,
            undefined,
            true
          );
          assertSemanticModel(ui5Model);

          // Check the files were created in the folder
          const files = await readdir(cachePath);
          expect(files).not.toBeEmpty();

          // Call getSemanticModel again with the same path and check it doesn't try to read from the URL
          let fetcherCalled = false;
          const ui5ModelFromCache = await getSemanticModelWithFetcher(
            (url: string): never => {
              fetcherCalled = true;
              throw new Error(
                `The files should be taken from the cache, got call for ${url}`
              );
            },
            cachePath,
            FRAMEWORK,
            undefined,
            true
          );
          expect(fetcherCalled).toBeFalse();
          // Make sure it's not the model itself that is cached
          expect(ui5ModelFromCache).not.toBe(ui5Model);
          // Check we got the same result (we can't use deep equal so the check is shallow)
          forEach(ui5Model, (value, key) => {
            if (isPlainObject(value)) {
              expect(
                Object.keys(
                  ui5ModelFromCache[key as keyof UI5SemanticModel] as Record<
                    string,
                    unknown
                  >
                )
              ).toIncludeSameMembers(
                Object.keys(value as Record<string, unknown>)
              );
            }
          });
          assertSemanticModel(ui5ModelFromCache);
        },
        GET_MODEL_TIMEOUT
      );

      it(
        "doesn't fail when file cannot be written to the cache",
        async () => {
          // Create a folder with the file name so the file will not be written
          const cacheFilePath = getCacheFilePath(
            getCacheFolder(cachePath, FRAMEWORK, VERSION),
            "sap.m"
          );
          expectExists(cacheFilePath, "cacheFilePath");
          await mkdirs(cacheFilePath);

          const ui5Model = await getSemanticModel(
            cachePath,
            FRAMEWORK,
            undefined
          );
          expect(ui5Model).not.toBeUndefined();
          // Check we still got the sap.m library data
          expect(Object.keys(ui5Model.namespaces)).toContain("sap.m");
          expect(ui5Model.namespaces["sap.m"].library).toEqual("sap.m");
        },
        GET_MODEL_TIMEOUT
      );

      it(
        "doesn't fail when file cannot be read from the cache",
        async () => {
          // Create a file with non-json content so the file will not be deserialized
          const cacheFolder = getCacheFolder(cachePath, FRAMEWORK, VERSION);
          await mkdirs(cacheFolder);
          const cacheFilePath = getCacheFilePath(cacheFolder, "sap.m");
          expectExists(cacheFilePath, "cacheFilePath");
          await writeFile(cacheFilePath, "not json");

          const ui5Model = await getSemanticModel(
            cachePath,
            FRAMEWORK,
            undefined,
            true
          );
          expect(ui5Model).not.toBeUndefined();
          // Check we still got the sap.m library data
          expect(Object.keys(ui5Model.namespaces)).toContain("sap.m");
          expect(ui5Model.namespaces["sap.m"].library).toEqual("sap.m");
        },
        GET_MODEL_TIMEOUT
      );
    });

    describe("cache path is a file", () => {
      let cachePath: string;
      let cleanup: () => Promise<void>;
      beforeEach(async () => {
        ({ path: cachePath, cleanup } = await tempFile());
      });

      afterEach(async () => {
        await cleanup();
      });

      it(
        "does not cache the model",
        async () => {
          const ui5Model = await getSemanticModel(
            cachePath,
            FRAMEWORK,
            undefined,
            true
          );
          assertSemanticModel(ui5Model);

          // Call getSemanticModel again with the same path and check it doesn't try to read from the URL
          let fetcherCalled = false;
          await getSemanticModelWithFetcher(
            async (): Promise<FetchResponse> => {
              fetcherCalled = true;
              return {
                ok: true,
                status: 200,
                json: async (): Promise<unknown> => {
                  return {};
                },
              };
            },
            cachePath,
            FRAMEWORK,
            undefined,
            true
          );
          expect(fetcherCalled).toBeTrue();
        },
        GET_MODEL_TIMEOUT
      );
    });
  });

  describe("version negotiation", () => {
    let cachePath: string;
    let cleanup: () => Promise<void>;
    const versionMap = {
      SAPUI5: {
        latest: {
          version: "1.105.0",
          support: "Maintenance",
          lts: true,
        },
        "1.105": {
          version: "1.105.0",
          support: "Maintenance",
          lts: true,
        },
        "1.96": {
          version: "1.96.11",
          support: "Maintenance",
          lts: true,
        },
        "1.84": {
          version: "1.84.27",
          support: "Maintenance",
          lts: true,
        },
        "1.71": {
          version: "1.71.50",
          support: "Maintenance",
          lts: true,
        },
      },
      OpenUI5: {
        latest: {
          version: "1.106.0",
          support: "Maintenance",
          lts: true,
        },
        "1.106": {
          version: "1.106.0",
          support: "Maintenance",
          lts: true,
        },
        "1.71": {
          version: "1.71.50",
          support: "Maintenance",
          lts: true,
        },
      },
    };
    const versionInfo = {
      libraries: [
        {
          name: "sap.ui.core",
        },
      ],
    };
    const createResponse = (ok: boolean, status: number, json?: unknown) => {
      return {
        ok,
        status,
        json: async (): Promise<unknown> => {
          return json;
        },
      };
    };

    beforeEach(async () => {
      ({ path: cachePath, cleanup } = await tempFile());
    });

    afterEach(async () => {
      await cleanup();
    });

    it("resolve the default version", async () => {
      const objNegotiatedVersionWithFetcher = await negotiateVersionWithFetcher(
        async (): Promise<FetchResponse> => {
          return createResponse(true, 200, versionMap[FRAMEWORK]);
        },
        async (): Promise<FetchResponse> => {
          return createResponse(true, 200, versionInfo);
        },
        cachePath,
        FRAMEWORK,
        VERSION
      );
      expect(objNegotiatedVersionWithFetcher.version).toEqual(VERSION);
    });

    it("resolve the default version open UI5", async () => {
      const objNegotiatedVersionWithFetcher = await negotiateVersionWithFetcher(
        async (): Promise<FetchResponse> => {
          return createResponse(true, 200, versionMap[OPEN_FRAMEWORK]);
        },
        async (): Promise<FetchResponse> => {
          return createResponse(true, 200, versionInfo);
        },
        cachePath,
        OPEN_FRAMEWORK,
        VERSION
      );
      expect(objNegotiatedVersionWithFetcher.version).toEqual(VERSION);
    });

    it("resolve available concrete version OpenUI5 (1.106.0)", async () => {
      const objNegotiatedVersionWithFetcher = await negotiateVersionWithFetcher(
        async (): Promise<FetchResponse> => {
          return createResponse(true, 200, versionMap[OPEN_FRAMEWORK]);
        },
        async (): Promise<FetchResponse> => {
          return createResponse(true, 200, versionInfo);
        },
        cachePath,
        OPEN_FRAMEWORK,
        "1.106.0"
      );
      expect(objNegotiatedVersionWithFetcher.version).toEqual("1.106.0");
      expect(objNegotiatedVersionWithFetcher.isFallback).toBeFalse();
      expect(objNegotiatedVersionWithFetcher.isIncorrectVersion).toBeFalse();
    });

    it("resolve available concrete version (1.105.0)", async () => {
      const objNegotiatedVersionWithFetcher = await negotiateVersionWithFetcher(
        async (): Promise<FetchResponse> => {
          return createResponse(true, 200, versionMap[FRAMEWORK]);
        },
        async (): Promise<FetchResponse> => {
          return createResponse(true, 200, versionInfo);
        },
        cachePath,
        FRAMEWORK,
        "1.105.0"
      );
      expect(objNegotiatedVersionWithFetcher.version).toEqual("1.105.0");
      expect(objNegotiatedVersionWithFetcher.isFallback).toBeFalse();
      expect(objNegotiatedVersionWithFetcher.isIncorrectVersion).toBeFalse();
    });

    it("resolve available concrete version (1.104.0)", async () => {
      const objNegotiatedVersionWithFetcher = await negotiateVersionWithFetcher(
        async (): Promise<FetchResponse> => {
          return createResponse(true, 200, versionMap[FRAMEWORK]);
        },
        async (): Promise<FetchResponse> => {
          return createResponse(true, 200, versionInfo);
        },
        cachePath,
        FRAMEWORK,
        "1.104.0"
      );
      expect(objNegotiatedVersionWithFetcher.version).toEqual("1.104.0");
      expect(objNegotiatedVersionWithFetcher.isFallback).toBeFalse();
      expect(objNegotiatedVersionWithFetcher.isIncorrectVersion).toBeFalse();
    });

    it("resolve not available concrete version (should be latest)", async () => {
      const objNegotiatedVersionWithFetcher = await negotiateVersionWithFetcher(
        async (): Promise<FetchResponse> => {
          return createResponse(true, 200, versionMap[FRAMEWORK]);
        },
        async (): Promise<FetchResponse> => {
          return createResponse(false, 404);
        },
        cachePath,
        FRAMEWORK,
        "1.104.0"
      );
      expect(objNegotiatedVersionWithFetcher.version).toEqual("1.105.0");
      expect(objNegotiatedVersionWithFetcher.isFallback).toBeFalse();
      expect(objNegotiatedVersionWithFetcher.isIncorrectVersion).toBeTrue();
    });

    it("resolve not available concrete version OpenUI5 (should be latest)", async () => {
      const objNegotiatedVersionWithFetcher = await negotiateVersionWithFetcher(
        async (): Promise<FetchResponse> => {
          return createResponse(true, 200, versionMap[OPEN_FRAMEWORK]);
        },
        async (): Promise<FetchResponse> => {
          return createResponse(false, 404);
        },
        cachePath,
        OPEN_FRAMEWORK,
        "1.104.0"
      );
      expect(objNegotiatedVersionWithFetcher.version).toEqual("1.106.0");
      expect(objNegotiatedVersionWithFetcher.isFallback).toBeFalse();
      expect(objNegotiatedVersionWithFetcher.isIncorrectVersion).toBeTrue();
    });

    it("resolve major.minor versions (should be closest)", async () => {
      let objNegotiatedVersionWithFetcher = await negotiateVersionWithFetcher(
        async (): Promise<FetchResponse> => {
          return createResponse(true, 200, versionMap[FRAMEWORK]);
        },
        async (): Promise<FetchResponse> => {
          return createResponse(false, 404);
        },
        cachePath,
        FRAMEWORK,
        "1.103"
      );
      expect(objNegotiatedVersionWithFetcher.version).toEqual("1.105.0");
      expect(objNegotiatedVersionWithFetcher.isFallback).toBeFalse();
      expect(objNegotiatedVersionWithFetcher.isIncorrectVersion).toBeTrue();
      objNegotiatedVersionWithFetcher = await negotiateVersionWithFetcher(
        async (): Promise<FetchResponse> => {
          return createResponse(true, 200, versionMap[FRAMEWORK]);
        },
        async (): Promise<FetchResponse> => {
          return createResponse(false, 404);
        },
        cachePath,
        FRAMEWORK,
        "1.96"
      );
      expect(objNegotiatedVersionWithFetcher.version).toEqual("1.96.11");
      expect(objNegotiatedVersionWithFetcher.isFallback).toBeFalse();
      expect(objNegotiatedVersionWithFetcher.isIncorrectVersion).toBeTrue();
      objNegotiatedVersionWithFetcher = await negotiateVersionWithFetcher(
        async (): Promise<FetchResponse> => {
          return createResponse(true, 200, versionMap[FRAMEWORK]);
        },
        async (): Promise<FetchResponse> => {
          return createResponse(false, 404);
        },
        cachePath,
        FRAMEWORK,
        "1.84"
      );
      expect(objNegotiatedVersionWithFetcher.version).toEqual("1.84.27");
      expect(objNegotiatedVersionWithFetcher.isFallback).toBeFalse();
      expect(objNegotiatedVersionWithFetcher.isIncorrectVersion).toBeTrue();
      objNegotiatedVersionWithFetcher = await negotiateVersionWithFetcher(
        async (): Promise<FetchResponse> => {
          return createResponse(true, 200, versionMap[FRAMEWORK]);
        },
        async (): Promise<FetchResponse> => {
          return createResponse(false, 404);
        },
        cachePath,
        FRAMEWORK,
        "1.71"
      );
      expect(objNegotiatedVersionWithFetcher.version).toEqual("1.71.50");
      expect(objNegotiatedVersionWithFetcher.isFallback).toBeFalse();
      expect(objNegotiatedVersionWithFetcher.isIncorrectVersion).toBeTrue();
      objNegotiatedVersionWithFetcher = await negotiateVersionWithFetcher(
        async (): Promise<FetchResponse> => {
          return createResponse(true, 200, versionMap[FRAMEWORK]);
        },
        async (): Promise<FetchResponse> => {
          return createResponse(false, 404);
        },
        cachePath,
        FRAMEWORK,
        "1.18"
      );
      expect(objNegotiatedVersionWithFetcher.version).toEqual("1.71.50");
      expect(objNegotiatedVersionWithFetcher.isFallback).toBeFalse();
      expect(objNegotiatedVersionWithFetcher.isIncorrectVersion).toBeTrue();
    });

    it("resolve major version (should be closest)", async () => {
      const objNegotiatedVersionWithFetcher = await negotiateVersionWithFetcher(
        async (): Promise<FetchResponse> => {
          return createResponse(true, 200, versionMap[FRAMEWORK]);
        },
        async (): Promise<FetchResponse> => {
          return createResponse(false, 404);
        },
        cachePath,
        FRAMEWORK,
        "1"
      );
      expect(objNegotiatedVersionWithFetcher.version).toEqual("1.71.50");
      expect(objNegotiatedVersionWithFetcher.isFallback).toBeFalse();
      expect(objNegotiatedVersionWithFetcher.isIncorrectVersion).toBeTrue();
    });

    it("resolve invalid versions (should be latest)", async () => {
      let objNegotiatedVersionWithFetcher = await negotiateVersionWithFetcher(
        async (): Promise<FetchResponse> => {
          return createResponse(true, 200, versionMap[FRAMEWORK]);
        },
        async (): Promise<FetchResponse> => {
          return createResponse(false, 404);
        },
        cachePath,
        FRAMEWORK,
        ""
      );
      expect(objNegotiatedVersionWithFetcher.version).toEqual("1.71.49");
      expect(objNegotiatedVersionWithFetcher.isFallback).toBeTrue();
      expect(objNegotiatedVersionWithFetcher.isIncorrectVersion).toBeFalse();
      objNegotiatedVersionWithFetcher = await negotiateVersionWithFetcher(
        async (): Promise<FetchResponse> => {
          return createResponse(true, 200, versionMap[FRAMEWORK]);
        },
        async (): Promise<FetchResponse> => {
          return createResponse(false, 404);
        },
        cachePath,
        FRAMEWORK,
        undefined
      );
      expect(objNegotiatedVersionWithFetcher.version).toEqual("1.71.49");
      expect(objNegotiatedVersionWithFetcher.isFallback).toBeTrue();
      expect(objNegotiatedVersionWithFetcher.isIncorrectVersion).toBeFalse();
    });

    it("resolve invalid versions OpenUI5 (should be latest)", async () => {
      const objNegotiatedVersionWithFetcher = await negotiateVersionWithFetcher(
        async (): Promise<FetchResponse> => {
          return createResponse(true, 200, versionMap[OPEN_FRAMEWORK]);
        },
        async (): Promise<FetchResponse> => {
          return createResponse(false, 404);
        },
        cachePath,
        OPEN_FRAMEWORK,
        ""
      );
      expect(objNegotiatedVersionWithFetcher.version).toEqual("1.71.49");
      expect(objNegotiatedVersionWithFetcher.isFallback).toBeTrue();
      expect(objNegotiatedVersionWithFetcher.isIncorrectVersion).toBeFalse();
    });
  });
});
