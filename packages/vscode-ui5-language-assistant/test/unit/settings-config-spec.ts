import { readJsonSync } from "fs-extra";
import { forEach, set, pickBy, has, keys, camelCase } from "lodash";
import { getDefaultSettings } from "@ui5-language-assistant/settings";
import * as settingsModule from "@ui5-language-assistant/settings";
import { LOGGING_LEVEL_CONFIG_PROP } from "../../src/constants";
import chai from "chai";

import deepEqualInAnyOrder from "deep-equal-in-any-order";
chai.use(deepEqualInAnyOrder);
import { expect } from "chai";
describe("settings configuration properties", () => {
  let packageJsonSettings: Record<string, Setting>;

  beforeAll(() => {
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
      expect(
        typeof value.default,
        `Setting ${key} default value type does not match the setting's defined type`
      ).to.equal(value.type);
    });
  });

  it("settings in package.json are in sync with the settings package", () => {
    const defaultSettingsFromPackageJson = parseSettings(packageJsonSettings);
    const defaultSettings = getDefaultSettings();
    expect(
      defaultSettingsFromPackageJson,
      "settings from package.json don't match the default settings in the language server"
    ).to.deep.equal({
      UI5LanguageAssistant: defaultSettings,
    });
  });

  it("enums in package.json are in sync with the settings package", () => {
    const pkgJsonSettingsWithEnum = pickBy(packageJsonSettings, (_) =>
      has(_, "enum")
    );
    forEach(pkgJsonSettingsWithEnum, (pkgJsonSetting, settingsKey) => {
      const settingsModulePropName = camelCase(
        settingsKey.replace(
          /UI5LanguageAssistant.(\w+)\.(\w+)/,
          "valid $1 $2 values"
        )
      );
      const settingsModulePropValue = keys(
        settingsModule[settingsModulePropName]
      );
      const pkgJsonPropValue = pkgJsonSetting.enum;
      expect(settingsModulePropValue).to.deep.equalInAnyOrder(pkgJsonPropValue);
    });
  });

  it("use the correct logging configuration property name", () => {
    expect(packageJsonSettings[LOGGING_LEVEL_CONFIG_PROP]).to.exist;
    expect(
      packageJsonSettings[LOGGING_LEVEL_CONFIG_PROP].description
    ).to.include("logging");
  });

  type Setting = {
    scope: string;
    type: string;
    default: unknown;
    description: string;
    enum?: string[];
  };

  function parseSettings(properties: Record<string, Setting>): unknown {
    const defaultSettings = {};
    forEach(properties, (value, key) => {
      set(defaultSettings, key, value.default);
    });
    return defaultSettings;
  }
});
