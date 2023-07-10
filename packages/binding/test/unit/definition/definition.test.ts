import { join } from "path";
import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
} from "@ui5-language-assistant/test-framework";
import { getContext } from "@ui5-language-assistant/context";
import { BindContext } from "../../../src/types";
import { getPropertyBindingInfoElements } from "../../../src/definition/definition";

describe("definition", () => {
  let framework: TestFramework;
  let context: BindContext;
  const viewFilePathSegments = [
    "app",
    "manage_travels",
    "webapp",
    "ext",
    "main",
    "Main.view.xml",
  ];
  beforeAll(async () => {
    const config: Config = {
      projectInfo: {
        name: ProjectName.cap,
        type: ProjectType.CAP,
        npmInstall: true,
        deleteBeforeCopy: false,
      },
    };
    framework = new TestFramework(config);
    context = (await getContext(
      join(framework.getProjectRoot(), ...viewFilePathSegments)
    )) as BindContext;
  });
  describe("getPropertyBindingInfoElements", () => {
    it("get binding elements", () => {
      const result = getPropertyBindingInfoElements(context);
      expect(result).toMatchSnapshot();
    });
  });
});
