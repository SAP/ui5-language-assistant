import {
  EventEmitter,
  ExtensionContext,
  TextDocumentContentProvider,
  Uri,
} from "vscode";
import { getManifestSchemaProvider } from "../../src/manifest-schema-provider";
import * as logicUtils from "@ui5-language-assistant/logic-utils";
import { Response } from "node-fetch";
import { MANIFEST_SCHEMA } from "../../src/constants";
import { CancellationToken } from "vscode-languageclient";

const fakeExtensionContext: ExtensionContext = {
  asAbsolutePath: jest.fn().mockReturnValue("dummy/path/schema.json"),
} as unknown as ExtensionContext;

describe("Manifest schems provider", () => {
  it("load schema from local folder", async () => {
    const fetchSpy = jest
      .spyOn(logicUtils, "tryFetch")
      .mockResolvedValue(undefined);
    // simulate file system for loading schema json
    const mock = (await import("mock-fs")).default;
    try {
      const schemaDir = "dummy/path";
      mock({
        [schemaDir]: {
          ["schema.json"]: "schema content",
        },
      });

      const result = await getManifestSchemaProvider(
        fakeExtensionContext as unknown as ExtensionContext
      );
      expect(result.schemaContent).toBe("schema content");
    } finally {
      mock.restore();
      fetchSpy.mockRestore();
    }
  });

  it("load schema from web", async () => {
    const fetchSpy = jest.spyOn(logicUtils, "tryFetch").mockResolvedValue({
      text: () => "schema content",
    } as unknown as Response);

    try {
      const result = await getManifestSchemaProvider(
        fakeExtensionContext as unknown as ExtensionContext
      );
      expect(result.schemaContent).toBe("schema content");
    } finally {
      fetchSpy.mockRestore();
    }
  });

  describe("class methods", () => {
    let provider: TextDocumentContentProvider;
    const uri: Uri = { scheme: MANIFEST_SCHEMA } as unknown as Uri;
    const token = undefined as unknown as CancellationToken;

    beforeAll(async () => {
      const fetchSpy = jest.spyOn(logicUtils, "tryFetch").mockResolvedValue({
        text: () => "schema content",
      } as unknown as Response);

      try {
        provider = await getManifestSchemaProvider(
          fakeExtensionContext as unknown as ExtensionContext
        );
      } finally {
        fetchSpy.mockRestore();
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
