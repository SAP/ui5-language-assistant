import * as fsExtra from "fs-extra";
import { join, dirname } from "path";
import {
  findManifestPath,
  getCustomViewId,
  getMainService,
  getManifestDetails,
  getServicePath,
  getUI5Manifest,
  initializeManifestData,
} from "../../src/manifest";
import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
} from "@ui5-language-assistant/test-framework";
import { cache } from "../../src/cache";
import { FileName } from "@sap-ux/project-access";
import { getProjectData } from "./utils";
import { URI } from "vscode-uri";
import { toPosixPath } from "../../src/utils/fileUtils";

const getAppRoot = (projectRoot: string) =>
  join(projectRoot, "app", "manage_travels", "webapp");

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

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("getUI5Manifest", () => {
    it("get undefined", async function () {
      const manifestRoot = join("/wrong/path", FileName.Manifest);
      // for consistency remove cache
      cache.deleteManifest(manifestRoot);
      const result = await getUI5Manifest(manifestRoot);
      expect(result).toBeUndefined();
    });
    it("get UI5 manifest", async function () {
      const projectRoot = testFramework.getProjectRoot();
      const appRoot = getAppRoot(projectRoot);
      const manifestRoot = join(appRoot, FileName.Manifest);
      // for consistency remove cache
      cache.deleteManifest(manifestRoot);
      const result = await getUI5Manifest(manifestRoot);
      expect(result).not.toBeUndefined();
    });
    it("get UI5 manifest from cache", async () => {
      const getManifestSpy = jest.spyOn(cache, "getManifest");
      const projectRoot = testFramework.getProjectRoot();
      const appRoot = getAppRoot(projectRoot);
      const manifestRoot = join(appRoot, FileName.Manifest);
      const result = await getUI5Manifest(manifestRoot);
      expect(getManifestSpy).toHaveBeenCalled();
      expect(result).toStrictEqual(getManifestSpy.mock.results[0].value);
    });
  });
  it("initializeManifestData", async () => {
    const projectRoot = testFramework.getProjectRoot();
    const appRoot = getAppRoot(projectRoot);
    cache.reset();
    await initializeManifestData(appRoot);
    const entries = cache.getManifestEntries();
    expect(entries.length).toBe(1);
    expect(
      toPosixPath(entries[0]).endsWith(
        "/test-packages/framework/projects-copy/context/cap/app/manage_travels/webapp/manifest.json"
      )
    ).toBeTrue();
    const data = cache.getManifest(entries[0]);
    expect(data).toBeObject();
  });
  it("getManifestDetails", async () => {
    const { appRoot } = await getProjectData(testFramework.getProjectRoot());
    const docPath = join(appRoot, "ext", "main", "Main.view.xml");
    const result = await getManifestDetails(docPath);
    expect(result).toStrictEqual({
      customViews: {
        "sap.fe.demo.managetravels.ext.main.Main": {
          entitySet: "Travel",
          contextPath: undefined,
        },
      },
      mainServicePath: "/processor/",
      flexEnabled: true,
      minUI5Version: "1.108.26",
      appId: "sap.fe.demo.managetravels",
      manifestPath: join(appRoot, "manifest.json"),
    });
  });

  it("extract details with content specified in manifest", async () => {
    const { appRoot } = await getProjectData(testFramework.getProjectRoot());
    const docPath = join(appRoot, "ext", "main", "Main.view.xml");
    const getManifestSpy = jest.spyOn(cache, "getManifest").mockReturnValue({
      ["sap.ui5"]: {
        routing: {
          targets: {
            t1: {
              options: {
                settings: {
                  entitySet: "Incidents",
                  contextPath: "/Incidents/to_Customer",
                  content: {
                    body: {
                      sections: {
                        section1: { template: "template1" },
                        section2: {
                          subSections: {
                            section1: { template: "template1_1" },
                          },
                        },
                      },
                    },
                    header: {
                      facets: {
                        section1: { template: "template2" },
                        section2: {},
                      },
                    },
                  },
                  controlConfiguration: {
                    tableControl1: {
                      columns: {
                        column1: { template: "template3" },
                        column2: { template: "template3" },
                        column3: {},
                      },
                    },
                    facetControl: {
                      sections: {
                        section1: {
                          template: "template4",
                          subSections: {
                            section1: { template: "template4_1" },
                          },
                        },
                      },
                    },
                    headerFacetControl: {
                      facets: {
                        section1: { template: "template2" },
                      },
                    },
                    formControl: {
                      fields: {
                        field1: { template: "template5" },
                      },
                    },
                    filterControl: {
                      filterFields: {
                        field1: { template: "template6" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    try {
      const result = await getManifestDetails(docPath);
      // adapt manifestPath
      result.manifestPath = result.manifestPath.split(appRoot).join(".");
      expect(result).toMatchInlineSnapshot(`
        Object {
          "appId": "",
          "customViews": Object {
            "template1": Object {
              "contextPath": "/Incidents/to_Customer",
              "entitySet": "Incidents",
            },
            "template1_1": Object {
              "contextPath": "/Incidents/to_Customer",
              "entitySet": "Incidents",
            },
            "template2": Object {
              "contextPath": "/Incidents/to_Customer",
              "entitySet": "Incidents",
            },
            "template3": Object {
              "contextPath": "/Incidents/to_Customer",
              "entitySet": "Incidents",
            },
            "template4": Object {
              "contextPath": "/Incidents/to_Customer",
              "entitySet": "Incidents",
            },
            "template4_1": Object {
              "contextPath": "/Incidents/to_Customer",
              "entitySet": "Incidents",
            },
            "template5": Object {
              "contextPath": "/Incidents/to_Customer",
              "entitySet": "Incidents",
            },
            "template6": Object {
              "contextPath": "/Incidents/to_Customer",
              "entitySet": "Incidents",
            },
          },
          "flexEnabled": false,
          "mainServicePath": "//",
          "manifestPath": "./manifest.json",
          "minUI5Version": undefined,
        }
      `);
    } finally {
      getManifestSpy.mockRestore();
    }
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
      expect(result).toStrictEqual({
        customViews: {
          "sap.fe.demo.managetravels.ext.main.Main": {
            entitySet: "Travel",
            contextPath: "/Travel",
          },
        },
        mainServicePath: "/processor/",
        flexEnabled: true,
        minUI5Version: "1.108.26",
        appId: "sap.fe.demo.managetravels",
        manifestPath: join(appRoot, "manifest.json"),
      });
    } finally {
      mock.restore();
    }
  });

  it("no manifest loaded", async () => {
    const { appRoot } = await getProjectData(testFramework.getProjectRoot());
    const docPath = join(appRoot, "ext", "main", "Main.view.xml");
    const manifestPath = (await findManifestPath(docPath)) || "";
    const cacheSpy = jest
      .spyOn(cache, "getManifest")
      .mockReturnValue(undefined);
    const mock = (await import("mock-fs")).default;
    try {
      const manifestDir = dirname(manifestPath);
      mock({
        [manifestDir]: {
          ["manifest.json"]: "null",
        },
      });

      const result = await getManifestDetails(docPath);
      expect(result).toStrictEqual({
        customViews: {},
        flexEnabled: false,
        mainServicePath: undefined,
        minUI5Version: undefined,
        appId: "",
        manifestPath: "",
      });
    } finally {
      cacheSpy.mockRestore();
      mock.restore();
    }
  });

  it("exception when reading manifest", async () => {
    const { appRoot } = await getProjectData(testFramework.getProjectRoot());
    const docPath = join(appRoot, "ext", "main", "Main.view.xml");
    const cacheGetSpy = jest
      .spyOn(cache, "getManifest")
      .mockReturnValue(undefined);
    const cacheSetSpy = jest
      .spyOn(cache, "setManifest")
      .mockImplementation(() => {
        throw Error("");
      });
    try {
      const result = await getManifestDetails(docPath);
      expect(result).toEqual({
        customViews: {},
        flexEnabled: false,
        mainServicePath: undefined,
        minUI5Version: undefined,
        appId: "",
        manifestPath: "",
      });
    } finally {
      cacheGetSpy.mockRestore();
      cacheSetSpy.mockRestore();
    }
  });

  describe("edge cases - extract details with some data missing", () => {
    let appRoot, docPath;
    beforeAll(async () => {
      appRoot = (await getProjectData(testFramework.getProjectRoot())).appRoot;
      docPath = join(appRoot, "ext", "main", "Main.view.xml");
    });

    const assert = async (manifest: unknown) => {
      const getManifestSpy = jest
        .spyOn(cache, "getManifest")
        .mockReturnValue(manifest);
      try {
        const result = await getManifestDetails(docPath);
        expect(result.customViews).toBeEmpty();
      } finally {
        getManifestSpy.mockRestore();
      }
    };

    it("empty manifest", async () => {
      await assert({});
    });

    it("case 1", async () => {
      await assert({
        ["sap.ui5"]: {},
      });
    });

    it("case 2", async () => {
      await assert({
        ["sap.ui5"]: {
          routing: {},
        },
      });
    });

    it("case 3", async () => {
      await assert({
        ["sap.ui5"]: {
          routing: {
            targets: {},
          },
        },
      });
    });

    it("case 4", async () => {
      await assert({
        ["sap.ui5"]: {
          routing: {
            targets: {
              t1: {},
            },
          },
        },
      });
    });

    it("case 5", async () => {
      await assert({
        ["sap.ui5"]: {
          routing: {
            targets: {
              t1: {
                options: {},
              },
            },
          },
        },
      });
    });

    it("case 6", async () => {
      await assert({
        ["sap.ui5"]: {
          routing: {
            targets: {
              t1: {
                options: {
                  settings: {},
                },
              },
            },
          },
        },
      });
    });

    it("case 7", async () => {
      await assert({
        ["sap.ui5"]: {
          routing: {
            targets: {
              t1: {
                options: {
                  settings: {
                    entitySet: "Incidents",
                  },
                },
              },
            },
          },
        },
      });
    });

    it("case 8", async () => {
      await assert({
        ["sap.ui5"]: {
          routing: {
            targets: {
              t1: {
                options: {
                  settings: {
                    entitySet: "Incidents",
                    contextPath: "/Incidents/to_Customer",
                  },
                },
              },
            },
          },
        },
      });
    });

    it("case 9", async () => {
      await assert({
        ["sap.ui5"]: {
          routing: {
            targets: {
              t1: {
                options: {
                  settings: {
                    entitySet: "Incidents",
                    contextPath: "/Incidents/to_Customer",
                    content: {},
                  },
                },
              },
            },
          },
        },
      });
    });

    it("case 10", async () => {
      await assert({
        ["sap.ui5"]: {
          routing: {
            targets: {
              t1: {
                options: {
                  settings: {
                    entitySet: "Incidents",
                    contextPath: "/Incidents/to_Customer",
                    content: {
                      body: {},
                    },
                  },
                },
              },
            },
          },
        },
      });
    });
  });

  describe("getMainService", () => {
    it("manifest without model definitions", async () => {
      const result = getMainService({
        "sap.ui5": {},
      } as never);
      expect(result).toEqual(undefined);
    });
    it("manifest without default model", async () => {
      const result = getMainService({
        "sap.ui5": {
          models: {},
        },
      } as never);
      expect(result).toEqual(undefined);
    });
    it("complete manifest", async () => {
      const { manifest } = await getProjectData(testFramework.getProjectRoot());
      const result = getMainService(manifest);
      expect(result).toEqual("mainService");
    });
  });
  it("getServicePath", async () => {
    const { manifest } = await getProjectData(testFramework.getProjectRoot());
    const result = await getServicePath(manifest, "mainService");
    expect(result).toEqual("/processor/");
  });
  describe("getCustomViewId", () => {
    it("does not fined app root and return undefined", async () => {
      const projectRoot = testFramework.getProjectRoot();
      const result = await getCustomViewId(projectRoot);
      expect(result).toBeEmpty();
    });
    it("get custom view id", async () => {
      const { appRoot } = await getProjectData(testFramework.getProjectRoot());
      const docPath = join(appRoot, "ext", "main", "Main.view.xml");
      const result = await getCustomViewId(docPath);
      expect(result).toEqual("sap.fe.demo.managetravels.ext.main.Main");
    });
    it("get custom view id for fragment", async () => {
      const { appRoot } = await getProjectData(testFramework.getProjectRoot());
      const docPath = join(appRoot, "ext", "main", "custom.fragment.xml");
      const result = await getCustomViewId(docPath);
      expect(result).toEqual("sap.fe.demo.managetravels.ext.main.custom");
    });
    it("edge case - path === appRoot", async () => {
      const { appRoot } = await getProjectData(testFramework.getProjectRoot());
      const docPath = appRoot;
      const result = await getCustomViewId(docPath);
      expect(result).toEqual("");
    });
  });
});
