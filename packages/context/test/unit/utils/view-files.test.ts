import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
} from "@ui5-language-assistant/test-framework";
import { join } from "path";
import { getViewFiles } from "../../../src/utils";
import { cache } from "../../../src/cache";
import type { XMLDocument } from "@xml-tools/ast";

describe("view-files", () => {
  let testFramework: TestFramework;
  beforeAll(function () {
    const useConfig: Config = {
      projectInfo: {
        name: ProjectName.cap,
        type: ProjectType.CAP,
        npmInstall: false,
      },
    };
    testFramework = new TestFramework(useConfig);
  }, 5 * 60000);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("get cached view files", async () => {
    // arrange
    const getViewFilesStub = jest
      .spyOn(cache, "getViewFiles")
      .mockReturnValue({ documentPath: {} as XMLDocument });
    const projectRoot = testFramework.getProjectRoot();
    const webapp = join(projectRoot, "app", "manage_travels", "webapp");
    // act
    const viewFiles = await getViewFiles(webapp);
    // assert
    expect(getViewFilesStub).toHaveBeenCalledOnce();
    expect(Object.keys(viewFiles).length).toBeGreaterThan(0);
  });

  it("get view files", async () => {
    // arrange
    cache.reset();
    const projectRoot = testFramework.getProjectRoot();
    const webapp = join(projectRoot, "app", "manage_travels", "webapp");
    const documentPath = join(
      projectRoot,
      "app",
      "manage_travels",
      "webapp",
      "ext",
      "main",
      "Main.view.xml"
    );
    // act
    const viewFiles = await getViewFiles(webapp);
    // assert
    expect(Object.keys(viewFiles).length).toBeGreaterThan(1);
    expect(viewFiles[documentPath]).toBeDefined();
  });
});
