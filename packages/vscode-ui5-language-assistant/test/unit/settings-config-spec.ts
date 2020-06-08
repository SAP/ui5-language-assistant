import { expect } from "chai";
import { readJsonSync } from "fs-extra";
import { forEach, set } from "lodash";
import { getDefaultSettings } from "@ui5-language-assistant/settings";

describe("settings configuration properties", () => {
  let packageJsonSettings: Record<string, Setting>;
  before(() => {
    // Get the settings from the package.json
    const packageJsonPath = require.resolve(
      "vscode-ui5-language-assistant/package.json"
    );
    const packageJsonContent = readJsonSync(packageJsonPath);
    packageJsonSettings =
      packageJsonContent.contributes.configuration.properties;
  });

  it("default setting values in package.json have the correct type", () => {
    forEach(packageJsonSettings, (value, key) => {
      expect(typeof value.default, `setting: ${key}`).to.equal(value.type);
    });
  });

  it("settings in package.json are in sync with the settings package", () => {
    const defaultSettingsFromPackageJson = parseSettings(packageJsonSettings);
    const defaultSettings = getDefaultSettings();
    expect(defaultSettingsFromPackageJson).to.deep.equal({
      UI5LanguageAssistant: defaultSettings,
    });
  });

  type Setting = {
    scope: string;
    type: string;
    default: unknown;
    description: string;
  };
  function parseSettings(properties: Record<string, Setting>): unknown {
    const defaultSettings = {};
    forEach(properties, (value, key) => {
      set(defaultSettings, key, value.default);
    });
    return defaultSettings;
  }
});
