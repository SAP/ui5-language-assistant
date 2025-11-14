import { getLogger } from "../../src/utils";
import { parseServiceFiles } from "../../src/parser";
import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
} from "@ui5-language-assistant/test-framework";

// Mock the logger
jest.mock("../../src/utils", () => ({
  getLogger: jest.fn(() => ({
    warn: jest.fn(),
  })),
}));

const mockLogger = {
  warn: jest.fn(),
};

describe("parser", () => {
  let testFramework: TestFramework;
  beforeAll(function () {
    const useConfig: Config = {
      projectInfo: {
        name: ProjectName.cap,
        type: ProjectType.CAP,
        npmInstall: true,
      },
    };
    testFramework = new TestFramework(useConfig);
  }, 5 * 60000 + 10000);

  beforeEach(() => {
    jest.clearAllMocks();
    (getLogger as jest.Mock).mockReturnValue(mockLogger);
  });
  describe("parseServiceFiles", () => {
    it("return undefined", async () => {
      const result = await parseServiceFiles({
        metadataContent: undefined,
        annotationFiles: [],
        path: "/processor/",
      });
      expect(result).toBeUndefined();
    });
    it("get local metadata file", async () => {
      const metadataSegments = [
        "app",
        "manage_travels",
        "webapp",
        "localService",
        "metadata.xml",
      ];
      const annoFileSegments = [
        "app",
        "manage_travels",
        "webapp",
        "annotations",
        "annotation.xml",
      ];
      const metadataContent = await testFramework.getFileContent(
        metadataSegments
      );
      const annoFileContent = await testFramework.getFileContent(
        annoFileSegments
      );
      const result = await parseServiceFiles({
        metadataContent,
        annotationFiles: [annoFileContent],
        path: "/processor/",
      });
      expect(result).toContainAllKeys(["path", "convertedMetadata"]);
    });
    it("handle invalid annotation file gracefully", async () => {
      const metadataSegments = [
        "app",
        "manage_travels",
        "webapp",
        "localService",
        "metadata.xml",
      ];
      const metadataContent = await testFramework.getFileContent(
        metadataSegments
      );
      const invalidAnnotationContent =
        "<invalid>malformed xml content <invalid";

      const result = await parseServiceFiles({
        metadataContent,
        annotationFiles: [invalidAnnotationContent],
        path: "/processor/",
      });

      // Should still return result even with invalid annotation file
      expect(result).toContainAllKeys(["path", "convertedMetadata"]);
      expect(result?.path).toBe("/processor/");
      // Verify that warning was logged
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining(
          "parseServiceFiles: Failed to parse annotation file 1 at path /processor/"
        )
      );
    });
  });
});
