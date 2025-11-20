import { ExtensionContext } from "vscode";
import { getSchemaContent, getSchemaUri } from "../../../src/utils";
import { getLogger } from "../../../src/logger";
import { readFile, readdir } from "fs/promises";

// Mock the fs/promises module
jest.mock("fs/promises", () => ({
  readFile: jest.fn(),
  readdir: jest.fn(),
}));

// Mock the logger
jest.mock("../../../src/logger", () => ({
  getLogger: jest.fn(() => ({
    error: jest.fn(),
  })),
}));

const mockReadFile = readFile as jest.MockedFunction<typeof readFile>;
const mockReaddir = readdir as jest.MockedFunction<typeof readdir>;
const mockLogger = {
  error: jest.fn(),
};

(getLogger as jest.Mock).mockReturnValue(mockLogger);

describe("getSchemaContent", () => {
  let mockExtensionContext: ExtensionContext;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock extension context
    mockExtensionContext = {
      asAbsolutePath: jest.fn(),
    } as unknown as ExtensionContext;
  });

  describe("getSchemaContent", () => {
    it("should use schema-v1.81.0.json for version 1.x", async () => {
      const mockBasePath = "/mock/path/lib/src/manifest";
      const mockPath = `${mockBasePath}/schema-v1.81.0.json`;
      const mockContent = '{"version": "1.0"}';

      (mockExtensionContext.asAbsolutePath as jest.Mock).mockReturnValue(
        mockBasePath
      );
      mockReaddir.mockResolvedValue([
        "schema-v1.81.0.json",
        "schema-v2.1.0.json",
      ] as unknown as ReturnType<typeof readdir>);
      mockReadFile.mockResolvedValue(mockContent);

      const result = await getSchemaContent(mockExtensionContext, "1.136.11");

      expect(mockExtensionContext.asAbsolutePath).toHaveBeenCalledWith(
        "lib/src/manifest"
      );
      expect(mockReaddir).toHaveBeenCalledWith(mockBasePath);
      expect(mockReadFile).toHaveBeenCalledWith(mockPath, "utf8");
      expect(result).toBe(mockContent);
    });

    it("should use schema-v2.1.0.json for version 2.x", async () => {
      const mockBasePath = "/mock/path/lib/src/manifest";
      const mockPath = `${mockBasePath}/schema-v2.1.0.json`;
      const mockContent = '{"version": "2.0"}';

      (mockExtensionContext.asAbsolutePath as jest.Mock).mockReturnValue(
        mockBasePath
      );
      mockReaddir.mockResolvedValue([
        "schema-v1.81.0.json",
        "schema-v2.1.0.json",
      ] as unknown as ReturnType<typeof readdir>);
      mockReadFile.mockResolvedValue(mockContent);

      const result = await getSchemaContent(mockExtensionContext, "2.1.0");

      expect(mockExtensionContext.asAbsolutePath).toHaveBeenCalledWith(
        "lib/src/manifest"
      );
      expect(mockReaddir).toHaveBeenCalledWith(mockBasePath);
      expect(mockReadFile).toHaveBeenCalledWith(mockPath, "utf8");
      expect(result).toBe(mockContent);
    });

    it("should handle file reading errors gracefully", async () => {
      const mockBasePath = "/mock/path/lib/src/manifest";
      const mockPath = `${mockBasePath}/schema-v1.81.0.json`;
      const mockError = new Error("ENOENT: no such file or directory");

      (mockExtensionContext.asAbsolutePath as jest.Mock).mockReturnValue(
        mockBasePath
      );
      mockReaddir.mockResolvedValue([
        "schema-v1.81.0.json",
        "schema-v2.1.0.json",
      ] as unknown as ReturnType<typeof readdir>);
      mockReadFile.mockRejectedValue(mockError);

      const result = await getSchemaContent(mockExtensionContext, "1.0.0");

      expect(result).toBe("");
      expect(mockReadFile).toHaveBeenCalledWith(mockPath, "utf8");
      expect(mockLogger.error).toHaveBeenCalledWith(
        `Failed to read manifest content from ${mockPath}`,
        mockError
      );
    });

    it("should return empty string when schema file is not found", async () => {
      const mockBasePath = "/mock/path/lib/src/manifest";

      (mockExtensionContext.asAbsolutePath as jest.Mock).mockReturnValue(
        mockBasePath
      );
      mockReaddir.mockResolvedValue([
        "schema-v1.81.0.json",
        "schema-v2.1.0.json",
      ] as unknown as ReturnType<typeof readdir>);

      const result = await getSchemaContent(mockExtensionContext, "3.0.0");

      expect(result).toBe("");
      expect(mockReaddir).toHaveBeenCalledWith(mockBasePath);
      expect(mockLogger.error).toHaveBeenCalledWith(
        "No local manifest schema file found for major version 3"
      );
    });
  });
});

describe("getSchemaUri", () => {
  it("should get correct versioned uri", () => {
    const result = getSchemaUri("2.1.0");

    expect(result).toBe(
      "https://raw.githubusercontent.com/UI5/manifest/refs/tags/v2.1.0/schema.json"
    );
  });
});
