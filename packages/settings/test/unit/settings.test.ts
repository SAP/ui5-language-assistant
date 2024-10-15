import {
  getSettingsForDocument,
  getDefaultSettings,
  setGlobalSettings,
  setSettingsForDocument,
  hasSettingsForDocument,
  clearDocumentSettings,
  clearSettings,
  setConfigurationSettings,
  getConfigurationSettings,
} from "../../src/api";
import { resetSettings } from "../../src/settings";

describe("settings utilities", () => {
  beforeEach(() => {
    resetSettings();
  });

  describe("default settings", () => {
    it("by default, deprecated and experimental suggestions will not be offered", () => {
      const defaultSettings = getDefaultSettings();
      expect(defaultSettings.codeAssist.deprecated).toBeFalse();
      expect(defaultSettings.codeAssist.experimental).toBeFalse();
    });

    it("cannot be changed", () => {
      const defaultSettings = getDefaultSettings();
      expect(() => {
        defaultSettings.codeAssist.deprecated = true;
      }).toThrowWithMessage(
        TypeError,
        "Cannot assign to read only property 'deprecated' of object '#<Object>'"
      );
    });
  });

  describe("getSettingsForDocument", () => {
    it("will return the default settings when there are no settings for the document and no global settings", async () => {
      const docSettings = await getSettingsForDocument("doc1");
      expect(docSettings).toStrictEqual(getDefaultSettings());
    });

    it("will return the global settings when there is are no settings for the document", async () => {
      const globalSettings = {
        codeAssist: { deprecated: true, experimental: false },
        trace: { server: "off" as const },
        logging: { level: "off" as const },
        SplitAttributesOnFormat: true,
        LimitUniqueIdDiagnostics: false,
      };
      setGlobalSettings(globalSettings);
      const docSettings = await getSettingsForDocument("doc1");
      expect(docSettings).toStrictEqual(globalSettings);
    });

    it("will return global settings which are frozen", async () => {
      const globalSettings = {
        codeAssist: { deprecated: true, experimental: false },
        trace: { server: "off" as const },
        logging: { level: "off" as const },
        SplitAttributesOnFormat: true,
        LimitUniqueIdDiagnostics: false,
      };
      setGlobalSettings(globalSettings);
      const docSettings = await getSettingsForDocument("doc1");
      expect(() => {
        docSettings.codeAssist.deprecated = true;
      }).toThrowWithMessage(
        TypeError,
        "Cannot assign to read only property 'deprecated' of object '#<Object>'"
      );
    });

    it("will return the document's settings when they are set for the document", async () => {
      const docSettings = {
        codeAssist: { deprecated: true, experimental: true },
        trace: { server: "off" as const },
        logging: { level: "off" as const },
        SplitAttributesOnFormat: true,
        LimitUniqueIdDiagnostics: false,
      };
      setSettingsForDocument("doc1", Promise.resolve(docSettings));
      const result = await getSettingsForDocument("doc1");
      expect(result).toStrictEqual(docSettings);
    });
  });

  describe("hasSettingsForDocument", () => {
    it("will return true when settings were set for the document", () => {
      setSettingsForDocument(
        "doc1",
        Promise.resolve({
          codeAssist: { deprecated: true, experimental: true },
          trace: { server: "off" as const },
          logging: { level: "off" as const },
          SplitAttributesOnFormat: true,
          LimitUniqueIdDiagnostics: false,
        })
      );
      expect(hasSettingsForDocument("doc1")).toBeTrue();
    });

    it("will return false when settings were not set for the document", () => {
      expect(hasSettingsForDocument("doc1")).toBeFalse();

      // Set settings for another document and check it doesn't affect the first document
      setSettingsForDocument(
        "doc2",
        Promise.resolve({
          codeAssist: { deprecated: true, experimental: true },
          trace: { server: "off" as const },
          logging: { level: "off" as const },
          SplitAttributesOnFormat: true,
          LimitUniqueIdDiagnostics: false,
        })
      );
      expect(hasSettingsForDocument("doc1")).toBeFalse();
    });
  });

  describe("setSettingsForDocument", () => {
    it("will save the settings for the document when the document doesn't have settings", async () => {
      const docSettings = {
        codeAssist: { deprecated: true, experimental: true },
        trace: { server: "off" as const },
        logging: { level: "off" as const },
        SplitAttributesOnFormat: true,
        LimitUniqueIdDiagnostics: false,
      };
      setSettingsForDocument("doc1", Promise.resolve(docSettings));
      expect(await getSettingsForDocument("doc1")).toStrictEqual(docSettings);
    });

    it("will save the settings for the document when the document already has settings", async () => {
      const docSettings1 = {
        codeAssist: { deprecated: true, experimental: true },
        trace: { server: "off" as const },
        logging: { level: "off" as const },
        SplitAttributesOnFormat: true,
        LimitUniqueIdDiagnostics: false,
      };
      const docSettings2 = {
        codeAssist: { deprecated: true, experimental: false },
        trace: { server: "off" as const },
        logging: { level: "off" as const },
        SplitAttributesOnFormat: true,
        LimitUniqueIdDiagnostics: false,
      };
      setSettingsForDocument("doc1", Promise.resolve(docSettings1));
      setSettingsForDocument("doc1", Promise.resolve(docSettings2));
      expect(await getSettingsForDocument("doc1")).toStrictEqual(docSettings2);
    });
  });

  describe("clearSettings", () => {
    it("wil do nothing when there are no settings for any document", () => {
      // Check it doesn't fail
      clearSettings();
    });

    it("will remove the settings for all documents", () => {
      const docSettings1 = {
        codeAssist: { deprecated: true, experimental: true },
        trace: { server: "off" as const },
        logging: { level: "off" as const },
        SplitAttributesOnFormat: true,
        LimitUniqueIdDiagnostics: false,
      };
      const docSettings2 = {
        codeAssist: { deprecated: true, experimental: false },
        trace: { server: "off" as const },
        logging: { level: "off" as const },
        SplitAttributesOnFormat: true,
        LimitUniqueIdDiagnostics: false,
      };
      setSettingsForDocument("doc1", Promise.resolve(docSettings1));
      setSettingsForDocument("doc2", Promise.resolve(docSettings2));
      clearSettings();

      expect(hasSettingsForDocument("doc1")).toBeFalse();
      expect(hasSettingsForDocument("doc2")).toBeFalse();
    });
  });

  describe("clearDocumentSettings", () => {
    it("will do nothing when the document doesn't have settings", async () => {
      // Check it doesn't fail
      clearDocumentSettings("doc1");
      expect(await getSettingsForDocument("doc1")).toStrictEqual(
        getDefaultSettings()
      );
    });

    it("will remove the settings for a document that has settings", async () => {
      const docSettings = {
        codeAssist: { deprecated: true, experimental: true },
        trace: { server: "off" as const },
        logging: { level: "off" as const },
        SplitAttributesOnFormat: true,
        LimitUniqueIdDiagnostics: false,
      };
      setSettingsForDocument("doc1", Promise.resolve(docSettings));

      clearDocumentSettings("doc1");
      expect(await getSettingsForDocument("doc1")).toStrictEqual(
        getDefaultSettings()
      );
    });

    it("will not remove settings from other documents", async () => {
      const docSettings1 = {
        codeAssist: { deprecated: true, experimental: true },
        trace: { server: "off" as const },
        logging: { level: "off" as const },
        SplitAttributesOnFormat: true,
        LimitUniqueIdDiagnostics: false,
      };
      const docSettings2 = {
        codeAssist: { deprecated: true, experimental: false },
        trace: { server: "off" as const },
        logging: { level: "off" as const },
        SplitAttributesOnFormat: true,
        LimitUniqueIdDiagnostics: false,
      };
      setSettingsForDocument("doc1", Promise.resolve(docSettings1));
      setSettingsForDocument("doc2", Promise.resolve(docSettings2));

      clearDocumentSettings("doc1");
      expect(await getSettingsForDocument("doc2")).toStrictEqual(docSettings2);
    });
  });

  describe("setGlobalSettings", () => {
    it("will change the global settings", async () => {
      const globalSettings = {
        codeAssist: { deprecated: true, experimental: true },
        trace: { server: "off" as const },
        logging: { level: "off" as const },
        SplitAttributesOnFormat: true,
        LimitUniqueIdDiagnostics: false,
      };
      setGlobalSettings(globalSettings);
      expect(await getSettingsForDocument("doc1")).toStrictEqual(
        globalSettings
      );
    });
  });
  describe("configuration settings", () => {
    it("setConfigurationSettings", async () => {
      const configSettings = {
        SAPUI5WebServer: "http://localhost:3000/",
        codeAssist: { deprecated: true, experimental: true },
        trace: { server: "off" as const },
        logging: { level: "off" as const },
        SplitAttributesOnFormat: true,
        LimitUniqueIdDiagnostics: false,
      };
      setConfigurationSettings(configSettings);
      expect(getConfigurationSettings()).toStrictEqual(configSettings);
    });
  });
});
