import {
  EventEmitter,
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
import {
  MANIFEST_SCHEMA,
  SCHEMA_URI_V1,
  SCHEMA_URI_V2,
} from "../../src/constants";
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

  it("loads v1 schema from web", async () => {
    const fetchSpy = jest.spyOn(logicUtils, "tryFetch").mockResolvedValue({
      text: () => "v1 schema content",
    } as unknown as Response);

    getUI5ManifestSpy.mockResolvedValue({ _version: "1.0" });

    const result = await getManifestSchemaProvider(fakeExtensionContext);

    expect(fetchSpy).toHaveBeenCalledWith(SCHEMA_URI_V1);
    expect(result.schemaContent).toBe("v1 schema content");
  });

  it("loads v2 schema from web", async () => {
    const fetchSpy = jest.spyOn(logicUtils, "tryFetch").mockResolvedValue({
      text: () => "v2 schema content",
    } as unknown as Response);

    getUI5ManifestSpy.mockResolvedValue({ _version: "2.0.0" });

    const result = await getManifestSchemaProvider(fakeExtensionContext);

    expect(fetchSpy).toHaveBeenCalledWith(SCHEMA_URI_V2);
    expect(result.schemaContent).toBe("v2 schema content");
  });

  it("loads v1 schema from local when web fetch fails", async () => {
    const fetchSpy = jest
      .spyOn(logicUtils, "tryFetch")
      .mockResolvedValue(undefined);

    getUI5ManifestSpy.mockResolvedValue({ _version: "1.5" });

    const result = await getManifestSchemaProvider(fakeExtensionContext);

    expect(fetchSpy).toHaveBeenCalledWith(SCHEMA_URI_V1);
    expect(getSchemaContentSpy).toHaveBeenCalledWith(
      fakeExtensionContext,
      "1.5"
    );
    expect(result.schemaContent).toBe("local schema content");
  });

  it("loads v2 schema from local when web fetch fails", async () => {
    const fetchSpy = jest
      .spyOn(logicUtils, "tryFetch")
      .mockResolvedValue(undefined);

    getUI5ManifestSpy.mockResolvedValue({ _version: "2.1" });

    const result = await getManifestSchemaProvider(fakeExtensionContext);

    expect(fetchSpy).toHaveBeenCalledWith(SCHEMA_URI_V2);
    expect(getSchemaContentSpy).toHaveBeenCalledWith(
      fakeExtensionContext,
      "2.1"
    );
    expect(result.schemaContent).toBe("local schema content");
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
      expect(result instanceof EventEmitter).toBeTrue();
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
