import { join } from "path";
import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
} from "@ui5-language-assistant/test-framework";
import { finAdpdManifestPath } from "../../src/adp-manifest";

describe("adp-manifest", () => {
  let framework: TestFramework;
  beforeAll(function () {
    const useConfig: Config = {
      projectInfo: {
        name: ProjectName.cap,
        type: ProjectType.CAP,
        npmInstall: true,
      },
    };
    framework = new TestFramework(useConfig);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe("finAdpdManifestPath", () => {
    beforeAll(function () {
      const useConfig: Config = {
        projectInfo: {
          name: ProjectName.adp,
          type: ProjectType.ADP,
          npmInstall: false,
        },
      };
      framework = new TestFramework(useConfig);
    });
    it("undefined", async () => {
      const root = framework.getProjectRoot();
      const result = await finAdpdManifestPath(root);
      expect(result).toBeUndefined();
    });
    it("path to manifest.appdescr_variant file", async () => {
      const root = framework.getProjectRoot();
      const pathSegments = [
        "webapp",
        "changes",
        "fragments",
        "actionToolbar.fragment.xml",
      ];
      const docPath = join(root, ...pathSegments);
      const result = await finAdpdManifestPath(docPath);
      expect(result).toEqual(join(root, "webapp", "manifest.appdescr_variant"));
    });
  });
});
