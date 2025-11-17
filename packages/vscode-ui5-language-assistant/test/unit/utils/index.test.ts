import { ExtensionContext } from "vscode";
import { getSchemaContent } from "../../../src/utils";
import { getLogger } from "../../../src/logger";
import { readFile } from "fs/promises";

// Mock the fs/promises module
jest.mock("fs/promises", () => ({
  readFile: jest.fn(),
}));

// Mock the logger
jest.mock("../../../src/logger", () => ({
  getLogger: jest.fn(() => ({
    error: jest.fn(),
  })),
}));

const mockReadFile = readFile as jest.MockedFunction<typeof readFile>;
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
    it("should use schema-v1.json for version 1.x", async () => {
      const mockPath = "/mock/path/lib/src/manifest/schema-v1.json";
      const mockContent = '{"version": "1.0"}';

      (mockExtensionContext.asAbsolutePath as jest.Mock).mockReturnValue(
        mockPath
      );
      mockReadFile.mockResolvedValue(mockContent);

      const result = await getSchemaContent(mockExtensionContext, "1.136.11");

      expect(mockExtensionContext.asAbsolutePath).toHaveBeenCalledWith(
        "lib/src/manifest/schema-v1.json"
      );
      expect(mockReadFile).toHaveBeenCalledWith(mockPath, "utf8");
      expect(result).toBe(mockContent);
    });

    it("should use schema-v2.json for version 2.x", async () => {
      const mockPath = "/mock/path/lib/src/manifest/schema-v2.json";
      const mockContent = '{"version": "2.0"}';

      (mockExtensionContext.asAbsolutePath as jest.Mock).mockReturnValue(
        mockPath
      );
      mockReadFile.mockResolvedValue(mockContent);

      const result = await getSchemaContent(mockExtensionContext, "2.1.0");

      expect(mockExtensionContext.asAbsolutePath).toHaveBeenCalledWith(
        "lib/src/manifest/schema-v2.json"
      );
      expect(mockReadFile).toHaveBeenCalledWith(mockPath, "utf8");
      expect(result).toBe(mockContent);
    });

    it("should handle file reading errors gracefully", async () => {
      const mockPath = "/mock/path/lib/src/manifest/schema-v1.json";
      const mockError = new Error("ENOENT: no such file or directory");

      (mockExtensionContext.asAbsolutePath as jest.Mock).mockReturnValue(
        mockPath
      );
      mockReadFile.mockRejectedValue(mockError);

      const result = await getSchemaContent(mockExtensionContext, "1.0.0");

      expect(result).toBe("");
      expect(mockReadFile).toHaveBeenCalledWith(mockPath, "utf8");
      expect(mockLogger.error).toHaveBeenCalledWith(
        `Failed to read manifest content from ${mockPath}`,
        mockError
      );
    });
  });
});
