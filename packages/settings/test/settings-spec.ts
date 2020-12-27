import {
  resetSettings,
  getSettingsForDocument,
  getDefaultSettings,
  setGlobalSettings,
  setSettingsForDocument,
  hasSettingsForDocument,
  clearDocumentSettings,
  clearSettings,
} from "../src/settings";
import { expect } from "chai";

context("settings utilities", () => {
  beforeEach(() => {
    resetSettings();
  });

  context("default settings", () => {
    it("by default, deprecated and experimental suggestions will not be offered", () => {
      const defaultSettings = getDefaultSettings();
      expect(defaultSettings.codeAssist.deprecated).to.be.false;
      expect(defaultSettings.codeAssist.experimental).to.be.false;
    });

    it("cannot be changed", () => {
      const defaultSettings = getDefaultSettings();
      expect(() => {
        defaultSettings.codeAssist.deprecated = true;
      }).to.throw(TypeError, "read only");
    });
  });

  describe("getSettingsForDocument", () => {
    it("will return the default settings when there are no settings for the document and no global settings", async () => {
      const docSettings = await getSettingsForDocument("doc1");
      expect(docSettings).to.deep.equal(getDefaultSettings());
    });

    it("will return the global settings when there is are no settings for the document", async () => {
      const globalSettings = {
        codeAssist: { deprecated: true, experimental: false },
        trace: { server: "off" as const },
        logging: { level: "off" as const },
      };
      setGlobalSettings(globalSettings);
      const docSettings = await getSettingsForDocument("doc1");
      expect(docSettings).to.deep.equal(globalSettings);
    });

    it("will return global settings which are frozen", async () => {
      const globalSettings = {
        codeAssist: { deprecated: true, experimental: false },
        trace: { server: "off" as const },
        logging: { level: "off" as const },
      };
      setGlobalSettings(globalSettings);
      const docSettings = await getSettingsForDocument("doc1");
      expect(() => {
        docSettings.codeAssist.deprecated = true;
      }).to.throw(TypeError, "read only");
    });

    it("will return the document's settings when they are set for the document", async () => {
      const docSettings = {
        codeAssist: { deprecated: true, experimental: true },
        trace: { server: "off" as const },
        logging: { level: "off" as const },
      };
      setSettingsForDocument("doc1", Promise.resolve(docSettings));
      const result = await getSettingsForDocument("doc1");
      expect(result).to.deep.equal(docSettings);
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
        })
      );
      expect(hasSettingsForDocument("doc1")).to.be.true;
    });

    it("will return false when settings were not set for the document", () => {
      expect(hasSettingsForDocument("doc1")).to.be.false;

      // Set settings for another document and check it doesn't affect the first document
      setSettingsForDocument(
        "doc2",
        Promise.resolve({
          codeAssist: { deprecated: true, experimental: true },
          trace: { server: "off" as const },
          logging: { level: "off" as const },
        })
      );
      expect(hasSettingsForDocument("doc1")).to.be.false;
    });
  });

  describe("setSettingsForDocument", () => {
    it("will save the settings for the document when the document doesn't have settings", async () => {
      const docSettings = {
        codeAssist: { deprecated: true, experimental: true },
        trace: { server: "off" as const },
        logging: { level: "off" as const },
      };
      setSettingsForDocument("doc1", Promise.resolve(docSettings));
      expect(await getSettingsForDocument("doc1")).to.deep.equal(docSettings);
    });

    it("will save the settings for the document when the document already has settings", async () => {
      const docSettings1 = {
        codeAssist: { deprecated: true, experimental: true },
        trace: { server: "off" as const },
        logging: { level: "off" as const },
      };
      const docSettings2 = {
        codeAssist: { deprecated: true, experimental: false },
        trace: { server: "off" as const },
        logging: { level: "off" as const },
      };
      setSettingsForDocument("doc1", Promise.resolve(docSettings1));
      setSettingsForDocument("doc1", Promise.resolve(docSettings2));
      expect(await getSettingsForDocument("doc1")).to.deep.equal(docSettings2);
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
      };
      const docSettings2 = {
        codeAssist: { deprecated: true, experimental: false },
        trace: { server: "off" as const },
        logging: { level: "off" as const },
      };
      setSettingsForDocument("doc1", Promise.resolve(docSettings1));
      setSettingsForDocument("doc2", Promise.resolve(docSettings2));
      clearSettings();

      expect(hasSettingsForDocument("doc1")).to.be.false;
      expect(hasSettingsForDocument("doc2")).to.be.false;
    });
  });

  describe("clearDocumentSettings", () => {
    it("will do nothing when the document doesn't have settings", async () => {
      // Check it doesn't fail
      clearDocumentSettings("doc1");
      expect(await getSettingsForDocument("doc1")).to.deep.equal(
        getDefaultSettings()
      );
    });

    it("will remove the settings for a document that has settings", async () => {
      const docSettings = {
        codeAssist: { deprecated: true, experimental: true },
        trace: { server: "off" as const },
        logging: { level: "off" as const },
      };
      setSettingsForDocument("doc1", Promise.resolve(docSettings));

      clearDocumentSettings("doc1");
      expect(await getSettingsForDocument("doc1")).to.deep.equal(
        getDefaultSettings()
      );
    });

    it("will not remove settings from other documents", async () => {
      const docSettings1 = {
        codeAssist: { deprecated: true, experimental: true },
        trace: { server: "off" as const },
        logging: { level: "off" as const },
      };
      const docSettings2 = {
        codeAssist: { deprecated: true, experimental: false },
        trace: { server: "off" as const },
        logging: { level: "off" as const },
      };
      setSettingsForDocument("doc1", Promise.resolve(docSettings1));
      setSettingsForDocument("doc2", Promise.resolve(docSettings2));

      clearDocumentSettings("doc1");
      expect(await getSettingsForDocument("doc2")).to.deep.equal(docSettings2);
    });
  });

  describe("setGlobalSettings", () => {
    it("will change the global settings", async () => {
      const globalSettings = {
        codeAssist: { deprecated: true, experimental: true },
        trace: { server: "off" as const },
        logging: { level: "off" as const },
      };
      setGlobalSettings(globalSettings);
      expect(await getSettingsForDocument("doc1")).to.deep.equal(
        globalSettings
      );
    });
  });
});
