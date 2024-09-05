import { cache, getUI5Yaml, initializeUI5YamlData } from "../../src/api";
import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
} from "@ui5-language-assistant/test-framework";
import { toPosixPath } from "../../src/utils/fileUtils";
import { getVersionForXMLFile, getYamlDetails } from "../../src/ui5-yaml";
import { OPEN_FRAMEWORK } from "@ui5-language-assistant/constant";

describe("UI5 yaml data handling", () => {
  let testFramework: TestFramework;

  beforeAll(function () {
    const useConfig: Config = {
      projectInfo: {
        name: ProjectName.tsFreeStyle,
        type: ProjectType.UI5,
        npmInstall: true,
      },
    };
    testFramework = new TestFramework(useConfig);
  }, 5 * 60000); // 5 min for initial npm install

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("Initialize yaml data and read cached data", async () => {
    cache.reset();
    const folder = testFramework.getProjectRoot();
    await initializeUI5YamlData(folder);
    const entries = cache.getYamlDetailsEntries();
    expect(entries).toHaveLength(1);
    expect(
      toPosixPath(entries[0]).endsWith(
        `/test-packages/framework/projects-copy/context/ts-free-style/ui5.yaml`
      )
    ).toBeTrue();

    const cached = await getUI5Yaml(entries[0]);
    expect(cached).toEqual(cache.getYamlDetails(entries[0]));

    const empty = await getUI5Yaml("dummyPath", true);
    expect(empty).toBeUndefined();
  });

  it("version determination", async () => {
    cache.reset();
    const folder = testFramework.getProjectRoot();
    await initializeUI5YamlData(folder);
    const entries = cache.getYamlDetailsEntries();
    const details = cache.getYamlDetails(entries[0]);

    const dummyPath = entries[0] + "/dummyPath";
    cache.setYamlDetails(
      dummyPath,
      details || { framework: OPEN_FRAMEWORK, version: undefined }
    );
    let result = getVersionForXMLFile(dummyPath + "/a.xml");
    expect(result).toBe("1.104.0");

    cache.reset();
    result = getVersionForXMLFile(entries[0] + "/a.xml");
    expect(result).toBeUndefined();
  });

  it("default details", async () => {
    cache.reset();
    const result = await getYamlDetails("dummyPath");
    expect(result).toMatchInlineSnapshot(`
      Object {
        "framework": "SAPUI5",
        "version": undefined,
      }
    `);
  });
});
