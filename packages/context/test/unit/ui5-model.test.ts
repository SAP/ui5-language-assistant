// mock to test offline mode version negotiation, needed to override original methods
jest.mock("@ui5-language-assistant/logic-utils", () => {
  const actual = jest.requireActual("@ui5-language-assistant/logic-utils");
  return {
    ...actual,
    getLocalUrl: jest.fn().mockImplementation(actual.getLocalUrl),
    tryFetch: jest.fn().mockImplementation(actual.tryFetch),
  };
});

jest.mock("fs-extra", () => {
  const actual = jest.requireActual("fs-extra");
  return {
    ...actual,
    readJson: jest.fn().mockImplementation(actual.readJson),
    pathExists: jest.fn().mockImplementation(actual.pathExists),
    lstat: jest.fn().mockImplementation(actual.lstat),
  };
});

import { dir as tempDir, file as tempFile } from "tmp-promise";
import { readdir, mkdirs, writeFile } from "fs-extra";
import * as fsExtra from "fs-extra";
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
  VersionMapJsonType,
} from "../../src/ui5-model";
import { FetchResponse } from "@ui5-language-assistant/language-server";
import { fetch } from "@ui5-language-assistant/logic-utils";
import * as logicUtils from "@ui5-language-assistant/logic-utils";
import { getVersionJsonUrl } from "../../src/utils";
import semverMinSatisfying from "semver/ranges/min-satisfying";
import { Response } from "node-fetch";

const GET_MODEL_TIMEOUT = 30000;
const FRAMEWORK = "SAPUI5";
const OPEN_FRAMEWORK = "OpenUI5";
const FALLBACK_VERSION = "1.71.69";
const FALLBACK_VERSION_BASE = "1.71";
const UI5_VERSION_S4_PLACEHOLDER = "${sap.ui5.dist.version}";
const NO_CACHE_FOLDER = undefined;

type UI5FrameworkType = typeof FRAMEWORK | typeof OPEN_FRAMEWORK;
const frameworks = [FRAMEWORK, OPEN_FRAMEWORK] as UI5FrameworkType[];

async function getCurrentVersionMaps(
  framework: UI5FrameworkType
): Promise<VersionMapJsonType | undefined> {
  const url = getVersionJsonUrl(framework);
  const response = await fetch(url);
  if (response.ok) {
    return (await response.json()) as VersionMapJsonType;
  } else {
    return undefined;
  }
}

const latestFallbackPatchVersion: Record<UI5FrameworkType, string | undefined> =
  {
    OpenUI5: undefined,
    SAPUI5: undefined,
  };

const currentVersionMaps: Record<UI5FrameworkType, VersionMapJsonType> = {
  OpenUI5: {},
  SAPUI5: {},
};

const loadCurrentVersionMaps = Promise.all([
  getCurrentVersionMaps(FRAMEWORK).then((data) => {
    currentVersionMaps.SAPUI5 = data || {};
    latestFallbackPatchVersion.SAPUI5 = data?.[FALLBACK_VERSION_BASE]?.version;
  }),
  getCurrentVersionMaps(OPEN_FRAMEWORK).then((data) => {
    currentVersionMaps.OpenUI5 = data || {};
    latestFallbackPatchVersion.OpenUI5 = data?.[FALLBACK_VERSION_BASE]?.version;
  }),
]);

describe("the UI5 language assistant ui5 model", () => {
  // The default timeout is 2000ms and getSemanticModel can take ~3000-5000ms

  beforeAll(async () => {
    await loadCurrentVersionMaps;
  });

  function assertSemanticModel(
    ui5Model: UI5SemanticModel,
    expectedVersion?: string
  ): void {
    expect(ui5Model.version).toEqual(expectedVersion || FALLBACK_VERSION);

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
    expect(Object.keys(ui5Model.namespaces)).toInclude("sap.apf");
    expect(Object.keys(ui5Model.enums)).toInclude(
      "sap.ca.ui.charts.ChartSelectionMode"
    );
  }

  it("check loaded version maps correctness", () => {
    expect(latestFallbackPatchVersion.SAPUI5?.startsWith("1.71.")).toBeTrue();
    expect(currentVersionMaps.SAPUI5?.["latest"]).toBeDefined();
    expect(latestFallbackPatchVersion.OpenUI5?.startsWith("1.71.")).toBeTrue();
    expect(currentVersionMaps.OpenUI5?.["latest"]).toBeDefined();
  });

  it(
    "will get UI5 semantic model",
    async () => {
      const ui5Model = await getSemanticModel(
        NO_CACHE_FOLDER,
        FRAMEWORK,
        latestFallbackPatchVersion.SAPUI5,
        true
      );
      assertSemanticModel(ui5Model, latestFallbackPatchVersion.SAPUI5);
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
            latestFallbackPatchVersion.SAPUI5,
            true
          );
          assertSemanticModel(ui5Model, latestFallbackPatchVersion.SAPUI5);

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
            latestFallbackPatchVersion.SAPUI5,
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
          assertSemanticModel(
            ui5ModelFromCache,
            latestFallbackPatchVersion.SAPUI5
          );
        },
        GET_MODEL_TIMEOUT
      );

      it(
        "doesn't fail when file cannot be written to the cache",
        async () => {
          // Create a folder with the file name so the file will not be written
          const cacheFilePath = getCacheFilePath(
            getCacheFolder(cachePath, FRAMEWORK, FALLBACK_VERSION),
            "sap.m"
          );
          expectExists(cacheFilePath, "cacheFilePath");
          await mkdirs(cacheFilePath);

          const ui5Model = await getSemanticModel(
            cachePath,
            FRAMEWORK,
            latestFallbackPatchVersion.SAPUI5
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
          const cacheFolder = getCacheFolder(
            cachePath,
            FRAMEWORK,
            FALLBACK_VERSION
          );
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
            latestFallbackPatchVersion.SAPUI5,
            true
          );
          assertSemanticModel(ui5Model, latestFallbackPatchVersion.SAPUI5);

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
            latestFallbackPatchVersion.SAPUI5,
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
    const versionInfo = {
      libraries: [
        {
          name: "sap.ui.core",
        },
      ],
    };
    const createSuccessfulResponse = <T = unknown>(json: T) => {
      return {
        ok: true,
        status: 200,
        json: async (): Promise<T> => {
          return json;
        },
      };
    };
    const createFailedResponse = <T = undefined>() => {
      return {
        ok: false,
        status: 404,
        json: async (): Promise<T> => {
          return undefined as T;
        },
      };
    };

    beforeAll(async () => {
      await loadCurrentVersionMaps;
    });

    beforeEach(async () => {
      ({ path: cachePath, cleanup } = await tempFile());
    });

    afterEach(async () => {
      await cleanup();
    });

    const getExpectedVersion = (
      framework: typeof FRAMEWORK | typeof OPEN_FRAMEWORK,
      requestedVersion: string
    ) => {
      const versions = currentVersionMaps[framework];
      const versionList = Object.values(versions)
        .filter((entry) => !entry.version.startsWith("1.38."))
        .map((entry) => entry.version);
      const expectedVersion =
        semverMinSatisfying(versionList, `^${requestedVersion}`) ||
        versions["latest"].version;
      return expectedVersion;
    };

    describe.each(frameworks)("for framework %s", (framework) => {
      it("resolve the default version", async () => {
        const objNegotiatedVersionWithFetcher =
          await negotiateVersionWithFetcher(
            async (): Promise<FetchResponse<VersionMapJsonType>> => {
              return createSuccessfulResponse(currentVersionMaps[framework]);
            },
            async (): Promise<FetchResponse> => {
              return createSuccessfulResponse(versionInfo);
            },
            async (): Promise<FetchResponse> => {
              return createSuccessfulResponse({});
            },
            cachePath,
            framework,
            latestFallbackPatchVersion[framework]
          );
        expect(objNegotiatedVersionWithFetcher.version).toEqual(
          latestFallbackPatchVersion[framework]
        );
      });

      it("resolve available concrete version", async () => {
        const testVersionKey = Object.keys(currentVersionMaps[framework])[2];
        const testVersion =
          currentVersionMaps[framework][testVersionKey].version;
        const objNegotiatedVersionWithFetcher =
          await negotiateVersionWithFetcher(
            async (): Promise<FetchResponse<VersionMapJsonType>> => {
              return createSuccessfulResponse(currentVersionMaps[framework]);
            },
            async (): Promise<FetchResponse> => {
              return createSuccessfulResponse(versionInfo);
            },
            async (): Promise<FetchResponse> => {
              return createSuccessfulResponse({});
            },
            cachePath,
            framework,
            testVersion
          );
        expect(objNegotiatedVersionWithFetcher.version).toEqual(testVersion);
        expect(objNegotiatedVersionWithFetcher.isFallback).toBeFalse();
        expect(objNegotiatedVersionWithFetcher.isIncorrectVersion).toBeFalse();
      });

      it("resolve outdated but still available concrete version (1.104.0)", async () => {
        const testVersion = "1.104.0";
        const objNegotiatedVersionWithFetcher =
          await negotiateVersionWithFetcher(
            async (): Promise<FetchResponse<VersionMapJsonType>> => {
              return createSuccessfulResponse(currentVersionMaps[framework]);
            },
            async (): Promise<FetchResponse> => {
              return createSuccessfulResponse(versionInfo);
            },
            async (): Promise<FetchResponse> => {
              return createSuccessfulResponse({});
            },
            cachePath,
            framework,
            testVersion
          );
        expect(objNegotiatedVersionWithFetcher.version).toEqual(testVersion);
        expect(objNegotiatedVersionWithFetcher.isFallback).toBeFalse();
        expect(objNegotiatedVersionWithFetcher.isIncorrectVersion).toBeFalse();
      });

      it("resolve outdated but still available in cache concrete version (1.104.0)", async () => {
        const testVersion = "1.104.0";

        // Mock cache reader
        const fileReaderSpy = jest
          .spyOn(fsExtra, "readJson")
          .mockImplementation(async () => {
            return { key1: {} };
          });
        const pathExistsSpy = jest
          .spyOn(fsExtra, "pathExists")
          .mockImplementationOnce(async () => false) // version info json cache read fail, should send request
          .mockImplementationOnce(async () => true); // version libs cache read
        const lstatSpy = jest
          .spyOn(fsExtra, "lstat")
          .mockImplementation(
            async () => ({ isFile: () => true } as unknown as fsExtra.Stats)
          );
        jest.clearAllMocks(); // to reset call counters which are already above zero due to mocked fs-extra module

        try {
          const objNegotiatedVersionWithFetcher =
            await negotiateVersionWithFetcher(
              async (): Promise<FetchResponse<VersionMapJsonType>> => {
                return createSuccessfulResponse(currentVersionMaps[framework]);
              },
              async (): Promise<FetchResponse> => {
                return createSuccessfulResponse(versionInfo);
              },
              async (): Promise<FetchResponse> => {
                return createFailedResponse();
              },
              cachePath,
              framework,
              testVersion
            );
          expect(objNegotiatedVersionWithFetcher.version).toEqual(testVersion);
          expect(objNegotiatedVersionWithFetcher.isFallback).toBeFalse();
          expect(
            objNegotiatedVersionWithFetcher.isIncorrectVersion
          ).toBeFalse();
          expect(fileReaderSpy).toHaveBeenCalledOnce();
          const arg = fileReaderSpy.mock.calls[0];
          expect(
            arg[0]
              .replace(/\\/g, "/")
              .endsWith(
                `ui5-resources-cache/${framework}/1.104.0/sap.ui.core.json`
              )
          ).toBeTrue();
        } finally {
          fileReaderSpy.mockRestore();
          pathExistsSpy.mockRestore();
          lstatSpy.mockRestore();
        }
      });

      it("resolve outdated version with broken cache data (1.104.0)", async () => {
        const testVersion = "1.104.0";
        const expectedVersion = getExpectedVersion(framework, testVersion);

        // Mock cache reader
        const fileReaderSpy = jest
          .spyOn(fsExtra, "readJson")
          .mockImplementation(async () => {
            return { key1: {} };
          });
        const pathExistsSpy = jest
          .spyOn(fsExtra, "pathExists")
          .mockImplementationOnce(async () => false);

        try {
          const objNegotiatedVersionWithFetcher =
            await negotiateVersionWithFetcher(
              async (): Promise<FetchResponse<VersionMapJsonType>> => {
                return createSuccessfulResponse(currentVersionMaps[framework]);
              },
              async (): Promise<FetchResponse> => {
                return createSuccessfulResponse(versionInfo);
              },
              async (): Promise<FetchResponse> => {
                return createFailedResponse();
              },
              cachePath,
              framework,
              testVersion
            );
          expect(objNegotiatedVersionWithFetcher.version).toEqual(
            expectedVersion
          );
          expect(objNegotiatedVersionWithFetcher.isFallback).toBeFalse();
          expect(objNegotiatedVersionWithFetcher.isIncorrectVersion).toBeTrue();
        } finally {
          fileReaderSpy.mockRestore();
          pathExistsSpy.mockRestore();
        }
      });

      it("resolve not available concrete version (should be closest)", async () => {
        const testVersion = "1.104.0";
        const expectedVersion = getExpectedVersion(framework, testVersion);
        const objNegotiatedVersionWithFetcher =
          await negotiateVersionWithFetcher(
            async (): Promise<FetchResponse<VersionMapJsonType>> => {
              return createSuccessfulResponse(currentVersionMaps[framework]);
            },
            async (): Promise<FetchResponse> => {
              return createSuccessfulResponse(versionInfo);
            },
            async (): Promise<FetchResponse> => {
              return createFailedResponse();
            },
            cachePath,
            framework,
            testVersion
          );
        expect(objNegotiatedVersionWithFetcher.version).toEqual(
          expectedVersion
        );
        expect(objNegotiatedVersionWithFetcher.isFallback).toBeFalse();
        expect(objNegotiatedVersionWithFetcher.isIncorrectVersion).toBeTrue();
      });
    });

    describe("resolve major.minor versions", () => {
      const testCases: {
        version: () => string;
        expected: () => string;
      }[] = [
        {
          // outdated version
          version: () => "1.104",
          expected: () => getExpectedVersion(FRAMEWORK, "1.104"),
        },
        {
          // supported version
          version: () => Object.keys(currentVersionMaps.SAPUI5)[1],
          expected: () =>
            currentVersionMaps.SAPUI5[Object.keys(currentVersionMaps.SAPUI5)[1]]
              .version,
        },
        {
          // fallback base
          version: () => FALLBACK_VERSION_BASE,
          expected: () => latestFallbackPatchVersion.SAPUI5 || "",
        },
        {
          // out of support
          version: () => "1.18",
          expected: () => latestFallbackPatchVersion.SAPUI5 || "",
        },
      ];

      beforeAll(async () => {
        await loadCurrentVersionMaps;
      });

      it.each(testCases)("test case %#", async (testCase) => {
        const result = await negotiateVersionWithFetcher(
          async (): Promise<FetchResponse<VersionMapJsonType>> => {
            return createSuccessfulResponse(currentVersionMaps.SAPUI5);
          },
          async (): Promise<FetchResponse> => {
            return createFailedResponse();
          },
          async (): Promise<FetchResponse> => {
            return createFailedResponse();
          },
          cachePath,
          FRAMEWORK,
          testCase.version()
        );
        expect(result.version).toEqual(testCase.expected());
        expect(result.isFallback).toBeFalse();
        expect(result.isIncorrectVersion).toBeTrue();
      });
    });

    it("resolve major version (should be closest supported)", async () => {
      const expectedVersion = getExpectedVersion(FRAMEWORK, "1");
      const objNegotiatedVersionWithFetcher = await negotiateVersionWithFetcher(
        async (): Promise<FetchResponse<VersionMapJsonType>> => {
          return createSuccessfulResponse(currentVersionMaps.SAPUI5);
        },
        async (): Promise<FetchResponse> => {
          return createFailedResponse();
        },
        async (): Promise<FetchResponse> => {
          return createFailedResponse();
        },
        cachePath,
        FRAMEWORK,
        "1"
      );
      expect(objNegotiatedVersionWithFetcher.version).toEqual(expectedVersion);
      expect(objNegotiatedVersionWithFetcher.isFallback).toBeFalse();
      expect(objNegotiatedVersionWithFetcher.isIncorrectVersion).toBeTrue();
    });

    it.each(frameworks)(
      "resolve invalid versions (should be fallback) %s",
      async (framework) => {
        let objNegotiatedVersionWithFetcher = await negotiateVersionWithFetcher(
          async (): Promise<FetchResponse<VersionMapJsonType>> => {
            return createSuccessfulResponse(currentVersionMaps[framework]);
          },
          async (): Promise<FetchResponse> => {
            return createFailedResponse();
          },
          async (): Promise<FetchResponse> => {
            return createFailedResponse();
          },
          cachePath,
          framework,
          ""
        );
        expect(objNegotiatedVersionWithFetcher.version).toEqual(
          latestFallbackPatchVersion[framework]
        );
        expect(objNegotiatedVersionWithFetcher.isFallback).toBeTrue();
        expect(objNegotiatedVersionWithFetcher.isIncorrectVersion).toBeFalse();

        objNegotiatedVersionWithFetcher = await negotiateVersionWithFetcher(
          async (): Promise<FetchResponse<VersionMapJsonType>> => {
            return createSuccessfulResponse(currentVersionMaps[framework]);
          },
          async (): Promise<FetchResponse> => {
            return createFailedResponse();
          },
          async (): Promise<FetchResponse> => {
            return createFailedResponse();
          },
          cachePath,
          framework,
          undefined
        );
        expect(objNegotiatedVersionWithFetcher.version).toEqual(
          latestFallbackPatchVersion[framework]
        );
        expect(objNegotiatedVersionWithFetcher.isFallback).toBeTrue();
        expect(objNegotiatedVersionWithFetcher.isIncorrectVersion).toBeFalse();
      }
    );

    it("resolve unsupported versions (should be latest fallback)", async () => {
      const objNegotiatedVersionWithFetcher = await negotiateVersionWithFetcher(
        async (): Promise<FetchResponse<VersionMapJsonType>> => {
          return createSuccessfulResponse(currentVersionMaps.SAPUI5);
        },
        async (): Promise<FetchResponse> => {
          return createFailedResponse();
        },
        async (): Promise<FetchResponse> => {
          return createFailedResponse();
        },
        cachePath,
        FRAMEWORK,
        "1.38"
      );
      expect(objNegotiatedVersionWithFetcher.version).toEqual(
        latestFallbackPatchVersion.SAPUI5
      );
      expect(objNegotiatedVersionWithFetcher.isFallback).toBeFalse();
      expect(objNegotiatedVersionWithFetcher.isIncorrectVersion).toBeTrue();
    });

    it("resolve wrong versions (should be latest)", async () => {
      const objNegotiatedVersionWithFetcher = await negotiateVersionWithFetcher(
        async (): Promise<FetchResponse<VersionMapJsonType>> => {
          return createSuccessfulResponse(currentVersionMaps.SAPUI5);
        },
        async (): Promise<FetchResponse> => {
          return createFailedResponse();
        },
        async (): Promise<FetchResponse> => {
          return createFailedResponse();
        },
        cachePath,
        FRAMEWORK,
        "a.b"
      );
      expect(objNegotiatedVersionWithFetcher.version).toEqual(
        currentVersionMaps.SAPUI5["latest"].version
      );
      expect(objNegotiatedVersionWithFetcher.isFallback).toBeFalse();
      expect(objNegotiatedVersionWithFetcher.isIncorrectVersion).toBeTrue();
    });

    it("resolve unsupported version placeholder - S/4 generator artifact (should be latest)", async () => {
      const objNegotiatedVersionWithFetcher = await negotiateVersionWithFetcher(
        async (): Promise<FetchResponse<VersionMapJsonType>> => {
          return createSuccessfulResponse(currentVersionMaps.SAPUI5);
        },
        async (): Promise<FetchResponse> => {
          return createFailedResponse();
        },
        async (): Promise<FetchResponse> => {
          return createFailedResponse();
        },
        cachePath,
        FRAMEWORK,
        UI5_VERSION_S4_PLACEHOLDER
      );
      expect(objNegotiatedVersionWithFetcher.version).toEqual(
        currentVersionMaps.SAPUI5["latest"].version
      );
      expect(objNegotiatedVersionWithFetcher.isFallback).toBeFalse();
      expect(objNegotiatedVersionWithFetcher.isIncorrectVersion).toBeTrue();
    });

    it("offline mode (should be the same as requested)", async () => {
      const fetchSpy = jest
        .spyOn(logicUtils, "tryFetch")
        .mockImplementation(async () => {
          return {} as Response;
        });
      const localUrlSpy = jest
        .spyOn(logicUtils, "getLocalUrl")
        .mockReturnValueOnce("localhost");

      const testVersion = "1.71.1";
      try {
        const objNegotiatedVersionWithFetcher =
          await negotiateVersionWithFetcher(
            async (): Promise<FetchResponse<VersionMapJsonType>> => {
              return createSuccessfulResponse(currentVersionMaps.SAPUI5);
            },
            async (): Promise<FetchResponse> => {
              return createFailedResponse();
            },
            async (): Promise<FetchResponse> => {
              return createFailedResponse();
            },
            cachePath,
            FRAMEWORK,
            testVersion
          );
        expect(objNegotiatedVersionWithFetcher.version).toEqual(testVersion);
        expect(objNegotiatedVersionWithFetcher.isFallback).toBeFalse();
        expect(objNegotiatedVersionWithFetcher.isIncorrectVersion).toBeFalse();
      } finally {
        localUrlSpy.mockRestore();
        fetchSpy.mockRestore();
      }
    });
  });
});
