import { expect } from "chai";
import { restore, spy } from "sinon";
import * as fsExtra from "fs-extra";
import { join } from "path";
import {
  findManifestPath,
  getCustomViewId,
  getMainService,
  getManifestDetails,
  getServicePath,
  getUI5Manifest,
} from "../src/manifest";
import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
} from "@ui5-language-assistant/test-framework";
import { cache } from "../src/cache";
import { FileName } from "@sap-ux/project-access";
import { getProjectData } from "./utils";
import { URI } from "vscode-uri";
import { dirname } from "path";

const getAppRoot = (projectRoot: string) =>
  join(projectRoot, "app", "manage_travels", "webapp");

describe("manifest", () => {
  let testFramework: TestFramework;
  before(function () {
    const timeout = 5 * 60000 + 10000; // 5 min for initial npm install + 10 sec
    this.timeout(timeout);
    const useConfig: Config = {
      projectInfo: {
        name: ProjectName.cap,
        type: ProjectType.CAP,
        npmInstall: true,
      },
    };
    testFramework = new TestFramework(useConfig);
  });
  afterEach(() => {
    restore();
  });
  context("getUI5Manifest", () => {
    it("get undefined", async function () {
      this.timeout(20000);
      const manifestRoot = join("/wrong/path", FileName.Manifest);
      // for consistency remove cache
      cache.deleteManifest(manifestRoot);
      const result = await getUI5Manifest(manifestRoot);
      expect(result).to.be.undefined;
    });
    it("get UI5 manifest", async function () {
      this.timeout(20000);
      const projectRoot = testFramework.getProjectRoot();
      const appRoot = getAppRoot(projectRoot);
      const manifestRoot = join(appRoot, FileName.Manifest);
      // for consistency remove cache
      cache.deleteManifest(manifestRoot);
      const result = await getUI5Manifest(manifestRoot);
      expect(result).not.to.be.undefined;
    });
    it("get UI5 manifest from cache", async () => {
      const getManifestSpy = spy(cache, "getManifest");
      const projectRoot = testFramework.getProjectRoot();
      const appRoot = getAppRoot(projectRoot);
      const manifestRoot = join(appRoot, FileName.Manifest);
      const result = await getUI5Manifest(manifestRoot);
      expect(getManifestSpy).to.have.been.called;
      expect(result).to.deep.equal(getManifestSpy.returnValues[0]);
    });
  });
  it("getManifestDetails", async () => {
    const { appRoot } = await getProjectData(testFramework.getProjectRoot());
    const docPath = join(appRoot, "ext", "main", "Main.view.xml");
    const result = await getManifestDetails(docPath);
    expect(result).to.deep.equal({
      customViews: {
        "sap.fe.demo.managetravels.ext.main.Main": {
          entitySet: "Travel",
        },
      },
      mainServicePath: "/processor/",
      flexEnabled: true,
      minUI5Version: "1.108.1",
    });
  });
  it("getManifestDetails with contextPath", async () => {
    const { appRoot } = await getProjectData(testFramework.getProjectRoot());
    const docPath = join(appRoot, "ext", "main", "Main.view.xml");
    const manifestPath = (await findManifestPath(docPath)) || "";
    cache.deleteManifest(manifestPath);

    // adjust manifest content to mock file read
    const manifestContent = await fsExtra.readFile(
      URI.parse(manifestPath).fsPath,
      "utf-8"
    );
    const manifest = JSON.parse(manifestContent);
    const settings =
      manifest["sap.ui5"]["routing"]["targets"]["TravelMain"]["options"][
        "settings"
      ];
    settings["contextPath"] = "/Travel";

    const mock = (await import("mock-fs")).default;
    const manifestDir = dirname(manifestPath);
    try {
      mock({
        [manifestDir]: {
          ["manifest.json"]: JSON.stringify(manifest),
        },
      });
      const result = await getManifestDetails(docPath);
      expect(result).to.deep.equal({
        customViews: {
          "sap.fe.demo.managetravels.ext.main.Main": {
            entitySet: "Travel",
            contextPath: "/Travel",
          },
        },
        mainServicePath: "/processor/",
        flexEnabled: true,
        minUI5Version: "1.108.1",
      });
    } finally {
      mock.restore();
    }
  });

  describe("getMainService", () => {
    it("manifest without model definitions", async () => {
      const result = getMainService({
        "sap.ui5": {},
      } as never);
      expect(result).to.equal(undefined);
    });
    it("manifest without default model", async () => {
      const result = getMainService({
        "sap.ui5": {
          models: {},
        },
      } as never);
      expect(result).to.equal(undefined);
    });
    it("complete manifest", async () => {
      const { manifest } = await getProjectData(testFramework.getProjectRoot());
      const result = getMainService(manifest);
      expect(result).to.equal("mainService");
    });
  });
  it("getServicePath", async () => {
    const { manifest } = await getProjectData(testFramework.getProjectRoot());
    const result = await getServicePath(manifest, "mainService");
    expect(result).to.equal("/processor/");
  });
  context("getCustomViewId", () => {
    it("does not fined app root and return undefined", async () => {
      const projectRoot = testFramework.getProjectRoot();
      const result = await getCustomViewId(projectRoot);
      expect(result).to.be.empty.string;
    });
    it("get custom view id", async () => {
      const { appRoot } = await getProjectData(testFramework.getProjectRoot());
      const docPath = join(appRoot, "ext", "main", "Main.view.xml");
      const result = await getCustomViewId(docPath);
      expect(result).to.be.equal("sap.fe.demo.managetravels.ext.main.Main");
    });
    it("get custom view id for fragment", async () => {
      const { appRoot } = await getProjectData(testFramework.getProjectRoot());
      const docPath = join(appRoot, "ext", "main", "custom.fragment.xml");
      const result = await getCustomViewId(docPath);
      expect(result).to.be.equal("sap.fe.demo.managetravels.ext.main.custom");
    });
  });
});
