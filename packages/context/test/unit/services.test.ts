import * as projectUtils from "../../src/utils/project";
import { join } from "path";
import * as loader from "../../src/loader";
import { getServices } from "../../src/services";
import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
} from "@ui5-language-assistant/test-framework";
import { cache } from "../../src/cache";
import { getProjectData } from "./utils";

describe("services", () => {
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
  }, 5 * 60000);

  beforeEach(() => {
    cache.reset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("getServices", () => {
    it("return empty services", async () => {
      const getProjectStub = jest
        .spyOn(loader, "getProject")
        .mockResolvedValue(undefined);
      const result = await getServices(__filename);
      expect(getProjectStub).toHaveBeenCalled();
      expect(result).toEqual({});
    });
    it("CAP services", async () => {
      const { appRoot } = await getProjectData(testFramework.getProjectRoot());
      const docPath = join(appRoot, "ext", "main", "Main.view.xml");
      const result = await getServices(docPath);
      expect(result).toContainAllKeys(["/processor/"]);
      expect(result["/processor/"]).toContainAllKeys([
        "path",
        "convertedMetadata",
      ]);
    });
    it("UI5 services", async () => {
      // stub to avoid another extra UI5 test project
      const getProjectInfoStub = jest
        .spyOn(projectUtils, "getProjectInfo")
        .mockResolvedValue({
          type: "UI5",
          kind: "UI5",
        });
      const projectRoot = testFramework.getProjectRoot();
      const { appRoot } = await getProjectData(projectRoot);
      // remove cache for consistency
      cache.deleteProject(projectRoot);

      const docPath = join(appRoot, "ext", "main", "Main.view.xml");
      const result = await getServices(docPath);
      expect(getProjectInfoStub).toHaveBeenCalled();
      expect(result).toContainAllKeys(["/processor/"]);
      expect(result["/processor/"]).toContainAllKeys([
        "path",
        "convertedMetadata",
      ]);
    });
  });
});
