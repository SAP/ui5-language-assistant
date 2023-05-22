import { parseServiceFiles } from "../../src/parser";
import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
} from "@ui5-language-assistant/test-framework";

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
  });
});
