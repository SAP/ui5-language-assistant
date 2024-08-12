import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { Context } from "@ui5-language-assistant/context";
import { DEFAULT_UI5_FRAMEWORK } from "@ui5-language-assistant/constant";

export const getDefaultContext = (ui5Model: UI5SemanticModel): Context => {
  return {
    ui5Model,
    customViewId: "",
    manifestDetails: {
      appId: "",
      manifestPath: "",
      flexEnabled: false,
      customViews: {},
      mainServicePath: undefined,
      minUI5Version: undefined,
    },
    services: {},
    yamlDetails: {
      framework: DEFAULT_UI5_FRAMEWORK,
      version: undefined,
    },
    viewFiles: {},
    documentPath: "",
  };
};
