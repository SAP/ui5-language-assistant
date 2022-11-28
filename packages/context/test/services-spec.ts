import * as projectUtils from "../src/utils/project";
import { expect } from "chai";
import { join } from "path";
import * as loader from "../src/loader";
import { getServices } from "../src/services";
import { restore, stub } from "sinon";
import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
} from "@ui5-language-assistant/test-framework";
import { cache } from "../src/cache";

describe("services", () => {
  let testFramework: TestFramework;
  before(function () {
    const timeout = 5 * 60000 + 8000; // 5 min for initial npm install + 8 sec
    this.timeout(timeout);
    const useConfig: Config = {
      projectInfo: {
        name: ProjectName.cap,
        type: ProjectType.cap,
        npmInstall: true,
      },
    };
    testFramework = new TestFramework(useConfig);
  });
  afterEach(() => {
    restore();
  });
  context("getServices", () => {
    it("return empty services", async () => {
      const getProjectStub = stub(loader, "getProject").resolves(undefined);
      const result = await getServices(__filename);
      expect(getProjectStub).to.have.been.called;
      expect(result).to.deep.equal({});
    });
    it("CAP services", async () => {
      const { appRoot } = await testFramework.getProjectData();
      const docPath = join(appRoot, "ext", "main", "Main.view.xml");
      const result = await getServices(docPath);
      expect(result).to.have.all.keys("/processor/");
      expect(result["/processor/"]).to.have.all.keys(
        "path",
        "convertedMetadata"
      );
    });
    it("UI5 services", async () => {
      // stub to avoid another extra UI5 test project
      const getProjectInfoStub = stub(projectUtils, "getProjectInfo").resolves({
        type: "UI5",
        kind: "UI5",
      });
      const { appRoot, projectRoot } = await testFramework.getProjectData();
      // remove cache for consistency
      cache.deleteProject(projectRoot);

      const docPath = join(appRoot, "ext", "main", "Main.view.xml");
      const result = await getServices(docPath);
      expect(getProjectInfoStub).to.have.been.called;
      expect(result).to.have.all.keys("/processor/");
      expect(result["/processor/"]).to.have.all.keys(
        "path",
        "convertedMetadata"
      );
    });
  });
});
