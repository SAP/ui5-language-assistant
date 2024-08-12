// mocking fs-extra to bypass loading data from file cache and cache updates
jest.mock("fs-extra", () => {
  return {
    pathExists: jest.fn().mockResolvedValue(false),
    writeJson: jest.fn().mockResolvedValue(null),
  };
});

import { file as tempFile } from "tmp-promise";
import { DEFAULT_UI5_FRAMEWORK } from "@ui5-language-assistant/constant";

import {
  VersionMapJsonType,
  negotiateVersionWithFetcher,
} from "../../src/ui5-model";
import { FetchResponse } from "@ui5-language-assistant/language-server";
import { DEFAULT_UI5_VERSION } from "@ui5-language-assistant/constant";

describe("the UI5 language assistant ui5 model", () => {
  // The default timeout is 2000ms and getSemanticModel can take ~3000-5000ms

  describe("version negotiation", () => {
    let cachePath: string;
    let cleanup: () => Promise<void>;
    const createFailedResponse = <T = undefined>() => {
      return {
        ok: false,
        status: 404,
        json: async (): Promise<T> => {
          return {} as T;
        },
      };
    };

    beforeEach(async () => {
      ({ path: cachePath, cleanup } = await tempFile());
    });

    afterEach(async () => {
      await cleanup();
    });

    it("fallback to default (while versions map is empty)", async () => {
      const objNegotiatedVersionWithFetcher = await negotiateVersionWithFetcher(
        async (): Promise<FetchResponse<VersionMapJsonType>> => {
          return createFailedResponse();
        },
        async (): Promise<FetchResponse> => {
          return createFailedResponse();
        },
        async (): Promise<FetchResponse> => {
          return createFailedResponse();
        },
        cachePath,
        DEFAULT_UI5_FRAMEWORK,
        "1.104.0"
      );
      expect(objNegotiatedVersionWithFetcher.isFallback).toBeTrue();
      expect(objNegotiatedVersionWithFetcher.version).toEqual(
        DEFAULT_UI5_VERSION
      );
      expect(objNegotiatedVersionWithFetcher.isIncorrectVersion).toBeTrue();

      // at this point the resolved version is kept in resolved versions cache
      // checking resolution from the cache to cover this case
      const objNegotiatedVersionWithFetcher2 =
        await negotiateVersionWithFetcher(
          async (): Promise<FetchResponse<VersionMapJsonType>> => {
            return createFailedResponse();
          },
          async (): Promise<FetchResponse> => {
            return createFailedResponse();
          },
          async (): Promise<FetchResponse> => {
            return createFailedResponse();
          },
          cachePath,
          DEFAULT_UI5_FRAMEWORK,
          "1.104.0"
        );
      expect(objNegotiatedVersionWithFetcher2.version).toEqual(
        DEFAULT_UI5_VERSION
      );
      expect(objNegotiatedVersionWithFetcher2.isIncorrectVersion).toBeTrue();
    });
  });
});
