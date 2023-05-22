jest.mock("find-up", () => {
  return () => {
    return Promise.resolve(undefined);
  };
});

import { join } from "path";
import { getCustomViewId, getManifestDetails } from "../../src/manifest";
import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
} from "@ui5-language-assistant/test-framework";
import { getProjectData } from "./utils";
import * as utils from "../../src/utils";

describe("manifest", () => {
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
  }, 5 * 60000 + 10000); // 5 min for initial npm install + 10 sec

  describe("edge cases", () => {
    it("manifest path not found", async () => {
      const { appRoot } = await getProjectData(testFramework.getProjectRoot());
      const docPath = join(appRoot, "ext", "main", "Main.view.xml");
      const result = await getManifestDetails(docPath);
      expect(result).toMatchInlineSnapshot(`
        Object {
          "customViews": Object {},
          "flexEnabled": false,
          "mainServicePath": undefined,
          "minUI5Version": undefined,
        }
      `);
    });

    it("get custom view id where manifest path not found", async () => {
      const { appRoot } = await getProjectData(testFramework.getProjectRoot());
      const docPath = join(appRoot, "ext", "main", "custom.fragment.xml");
      const findAppRootSpy = jest
        .spyOn(utils, "findAppRoot")
        .mockResolvedValue("dummy");
      try {
        const result = await getCustomViewId(docPath);
        expect(result).toEqual("");
      } finally {
        findAppRootSpy.mockRestore();
      }
    });
  });
});
