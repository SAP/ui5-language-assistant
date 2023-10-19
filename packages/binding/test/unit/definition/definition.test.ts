import { join } from "path";
import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
} from "@ui5-language-assistant/test-framework";
import { getContext } from "@ui5-language-assistant/context";
import { BindContext } from "../../../src/types";
import { getBindingElements } from "../../../src/definition/definition";
import { UI5Typedef } from "@ui5-language-assistant/semantic-model-types";
import { initI18n } from "../../../src/i18n";

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
    const i18n = await framework.initI18n();
    initI18n(i18n);
    context = (await getContext(
      join(framework.getProjectRoot(), ...viewFilePathSegments)
    )) as BindContext;
  });
  describe("getBindingElements", () => {
    it("get binding elements", () => {
      const result = getBindingElements(context);
      expect(result).toMatchSnapshot();
    });
    it("get binding elements - aggregation", () => {
      const result = getBindingElements(context, true);
      expect(result).toMatchSnapshot();
    });
    it("check fallback", () => {
      const result = getBindingElements(
        {
          ...context,
          ui5Model: {
            ...context.ui5Model,
            typedefs: {
              ...context.ui5Model.typedefs,
              "sap.ui.base.ManagedObject.PropertyBindingInfo":
                undefined as unknown as UI5Typedef,
            },
          },
        },
        false
      );
      expect(result).toMatchSnapshot();
    });
    it("check fallback - aggregation", () => {
      const result = getBindingElements(
        {
          ...context,
          ui5Model: {
            ...context.ui5Model,
            typedefs: {
              ...context.ui5Model.typedefs,
              "sap.ui.base.ManagedObject.AggregationBindingInfo":
                undefined as unknown as UI5Typedef,
            },
          },
        },
        true
      );
      expect(result).toMatchSnapshot();
    });
  });
});
