import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { Context } from "@ui5-language-assistant/context";

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
      framework: "SAPUI5",
      version: undefined,
    },
    viewFiles: {},
    documentPath: "",
  };
};
