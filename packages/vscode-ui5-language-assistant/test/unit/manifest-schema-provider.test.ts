import {
  ExtensionContext,
  TextDocumentContentProvider,
  Uri,
  window,
} from "vscode";
import { getManifestSchemaProvider } from "../../src/manifest-schema-provider";
import * as logicUtils from "@ui5-language-assistant/logic-utils";
import * as context from "@ui5-language-assistant/context";
import * as utils from "../../src/utils";
import { Response } from "node-fetch";
import { MANIFEST_SCHEMA } from "../../src/constants";
import { CancellationToken } from "vscode-languageclient";

const fakeExtensionContext: ExtensionContext = {
  asAbsolutePath: jest
    .fn()
    .mockReturnValue("dummy/path/lib/src/manifest/schema-v1.json"),
} as unknown as ExtensionContext;

describe("Manifest schema provider", () => {
  let findManifestPathSpy: jest.SpyInstance;
  let getUI5ManifestSpy: jest.SpyInstance;
  let getSchemaContentSpy: jest.SpyInstance;

  const mockActiveEditor = {
    document: {
      uri: { fsPath: "/path/to/file.js" },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default mocks
    Object.defineProperty(window, "activeTextEditor", {
      value: mockActiveEditor,
      configurable: true,
    });
    findManifestPathSpy = jest
      .spyOn(context, "findManifestPath")
      .mockResolvedValue("/path/to/manifest.json");
    getUI5ManifestSpy = jest
      .spyOn(context, "getUI5Manifest")
      .mockResolvedValue({
        _version: "1.0",
      });
    getSchemaContentSpy = jest
      .spyOn(utils, "getSchemaContent")
      .mockResolvedValue("local schema content");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns empty provider when no active editor", async () => {
    Object.defineProperty(window, "activeTextEditor", {
      value: undefined,
      configurable: true,
    });

    const result = await getManifestSchemaProvider(fakeExtensionContext);

    expect(result.schemaContent).toBe("");
  });

  it("returns empty provider when manifest path not found", async () => {
    findManifestPathSpy.mockResolvedValue(undefined);

    const result = await getManifestSchemaProvider(fakeExtensionContext);

    expect(result.schemaContent).toBe("");
  });

  it("returns empty provider when manifest cannot be loaded", async () => {
    getUI5ManifestSpy.mockResolvedValue(undefined);

    const result = await getManifestSchemaProvider(fakeExtensionContext);

    expect(result.schemaContent).toBe("");
  });

  it("loads schema from web with version placeholder replaced", async () => {
    const fetchSpy = jest.spyOn(logicUtils, "tryFetch").mockResolvedValue({
      text: () => "schema content from web",
    } as unknown as Response);

    getUI5ManifestSpy.mockResolvedValue({ _version: "1.58.0" });

    const result = await getManifestSchemaProvider(fakeExtensionContext);

    expect(fetchSpy).toHaveBeenCalledWith(utils.getSchemaUri("1.58.0"));
    expect(result.schemaContent).toBe("schema content from web");
  });

  it("loads schema from local when web fetch fails", async () => {
    const fetchSpy = jest
      .spyOn(logicUtils, "tryFetch")
      .mockResolvedValue(undefined);

    getUI5ManifestSpy.mockResolvedValue({ _version: "1.5.0" });

    const result = await getManifestSchemaProvider(fakeExtensionContext);

    expect(fetchSpy).toHaveBeenCalledWith(utils.getSchemaUri("1.5.0"));
    expect(getSchemaContentSpy).toHaveBeenCalledWith(
      fakeExtensionContext,
      "1.5.0"
    );
    expect(result.schemaContent).toBe("local schema content");
  });

  it("loads schema using version from manifestVersionChanged parameter", async () => {
    const fetchSpy = jest.spyOn(logicUtils, "tryFetch").mockResolvedValue({
      text: () => "schema content from web with version change",
    } as unknown as Response);

    const manifestVersionChanged = {
      changed: true,
      oldVersion: "1.0.0",
      newVersion: "2.0.0",
    };

    const result = await getManifestSchemaProvider(
      fakeExtensionContext,
      manifestVersionChanged
    );

    expect(fetchSpy).toHaveBeenCalledWith(utils.getSchemaUri("2.0.0"));
    expect(result.schemaContent).toBe(
      "schema content from web with version change"
    );
    expect(findManifestPathSpy).not.toHaveBeenCalled();
    expect(getUI5ManifestSpy).not.toHaveBeenCalled();
  });

  describe("class methods", () => {
    let provider: TextDocumentContentProvider;
    const uri: Uri = { scheme: MANIFEST_SCHEMA } as unknown as Uri;
    const token = undefined as unknown as CancellationToken;

    beforeAll(async () => {
      jest.spyOn(logicUtils, "tryFetch").mockResolvedValue({
        text: () => "schema content",
      } as unknown as Response);

      const findManifestPathTestSpy = jest
        .spyOn(context, "findManifestPath")
        .mockResolvedValue("/path/to/manifest.json");
      const getUI5ManifestTestSpy = jest
        .spyOn(context, "getUI5Manifest")
        .mockResolvedValue({
          _version: "1.0",
        });

      try {
        provider = await getManifestSchemaProvider(
          fakeExtensionContext as unknown as ExtensionContext
        );
      } finally {
        findManifestPathTestSpy.mockRestore();
        getUI5ManifestTestSpy.mockRestore();
      }
    });

    it("onDidChange", async () => {
      let result;
      const method = provider.onDidChange;
      if (method) {
        result = method(() => null);
      }
      expect(result).toBeDefined();
      expect(result).toHaveProperty("dispose");
      expect(typeof result?.dispose).toBe("function");
    });

    it("fireContentChange triggers event listeners", async () => {
      const mockListener = jest.fn();
      const testUri = Uri.parse(`${MANIFEST_SCHEMA}://test`);

      // Subscribe to the event
      expect(provider.onDidChange).toBeDefined();
      if (!provider.onDidChange) {
        throw new Error("onDidChange is not defined");
      }
      const disposable = provider.onDidChange(mockListener);

      // Trigger the event using type assertion to access private method
      const providerWithFireMethod = provider as TextDocumentContentProvider & {
        fireContentChange: (uri: Uri) => void;
      };
      providerWithFireMethod.fireContentChange(testUri);

      // Verify the listener was called with the URI
      expect(mockListener).toHaveBeenCalledWith(testUri);
      expect(mockListener).toHaveBeenCalledTimes(1);

      // Clean up
      disposable.dispose();
    });

    it("provideTextDocumentContent, correct schema", () => {
      const result = provider.provideTextDocumentContent(uri, token);
      expect(result).toBe("schema content");
    });

    it("provideTextDocumentContent, wrong schema", () => {
      const uri1: Uri = { ...uri, scheme: "dummy" } as Uri;
      const result = provider.provideTextDocumentContent(uri1, token);
      expect(result).toBeEmpty();
    });
  });
});
