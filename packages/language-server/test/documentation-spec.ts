import { expect } from "chai";
import {
  buildUI5Enum,
  generateModel,
} from "@ui5-language-assistant/test-utils";
import { generate } from "@ui5-language-assistant/semantic-model";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import {
  getNodeDetail,
  getNodeDocumentation,
  getUI5NodeName,
} from "../src/documentation";
import { dir as tempDir, file as tempFile } from "tmp-promise";

import { Position } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { getSemanticModel } from "../src/ui5-model";

describe("The @ui5-language-assistant/language-server <getNodeDocumentation> function", () => {
  let ui5SemanticModel: UI5SemanticModel;
  before(async function () {
    ui5SemanticModel = await generateModel({
      framework: "SAPUI5",
      version: "1.71.49",
      modelGenerator: generate,
    });
  });

  context("deprecatedInfo", () => {
    it("will get documentation with deprecatedInfo", () => {
      const ui5Enum = buildUI5Enum({
        name: "dummy-node",
        deprecatedInfo: {
          isDeprecated: true,
          since: "2.2.2",
          text: "dummy-text",
        },
      });
      const result = getNodeDocumentation(ui5Enum, ui5SemanticModel);
      expect(result.value).to.include(
        "Deprecated since version 2.2.2. dummy-text"
      );
    });
  });

  context("experimentalInfo", () => {
    it("will get documentation with experimentalInfo", () => {
      const ui5Enum = buildUI5Enum({
        name: "dummy-node",
        experimentalInfo: {
          isExperimental: true,
          since: "2.2.2",
          text: "dummyy-text",
        },
      });
      const result = getNodeDocumentation(ui5Enum, ui5SemanticModel);
      expect(result.value).to.include(
        "Experimental since version 2.2.2. dummyy-text"
      );
    });

    it("will get documentation with experimentalInfo - without since", () => {
      const ui5Enum = buildUI5Enum({
        name: "dummy-node",
        experimentalInfo: {
          isExperimental: true,
          since: undefined,
          text: "dummyy-text",
        },
      });
      const result = getNodeDocumentation(ui5Enum, ui5SemanticModel);
      expect(result.value).to.include("Experimental. dummyy-text");
      expect(result.value).to.not.include("since");
    });

    it("will get documentation with experimentalInfo - without text", () => {
      const ui5Enum = buildUI5Enum({
        name: "dummy-node",
        experimentalInfo: {
          isExperimental: true,
          since: "2.2.2",
          text: undefined,
        },
      });
      const result = getNodeDocumentation(ui5Enum, ui5SemanticModel);
      expect(result.value).to.include("Experimental since version 2.2.2.");
    });

    it("will get documentation with experimentalInfo - without since and text", () => {
      const ui5Enum = buildUI5Enum({
        name: "dummy-node",
        experimentalInfo: {
          isExperimental: true,
          since: undefined,
          text: undefined,
        },
      });
      const result = getNodeDocumentation(ui5Enum, ui5SemanticModel);
      expect(result.value).to.include("Experimental.");
    });

    it("get the UI5 node name with a model", async () => {
      const xmlSnippet = `<mvc:View displayBlock="true"
      xmlns="sap.m"
      xmlns:pwd="openui5.password"
      xmlns:mvc="sap.ui.core.mvc">
      <Page>
        <content>
          <Input liveChange="onInput" />
        </content>
      </Page>
    </mvc:View>`;
      const { document, position } = getXmlSnippet(xmlSnippet);

      const result = await getUI5NodeName(
        document.offsetAt(position),
        document.getText(),
        ui5SemanticModel
      );
      expect(getNodeDetail(result!)).to.equal("sap.m.Input");
    });

    it("get the UI5 node name without a model", async () => {
      const xmlSnippet = `<mvc:View displayBlock="true"
      xmlns="sap.m"
      xmlns:pwd="openui5.password"
      xmlns:mvc="sap.ui.core.mvc">
      <Page>
        <content>
          <Input liveChange="onInput" />
        </content>
      </Page>
    </mvc:View>`;

      const cachePath = await tempDir();
      const ui5Model = await getSemanticModel(
        cachePath.path,
        "SAPUI5",
        undefined,
        true
      );

      const { document, position } = getXmlSnippet(xmlSnippet);

      const result = await getUI5NodeName(
        document.offsetAt(position),
        document.getText(),
        undefined,
        cachePath.path,
        "SAPUI5",
        ui5Model.version
      );
      expect(getNodeDetail(result!)).to.equal("sap.m.Input");
    });
  });

  function getXmlSnippet(
    xmlSnippet: string
  ): { document: TextDocument; position: Position } {
    const xmlText = xmlSnippet.replace("⇶", "");
    const offset = xmlSnippet.indexOf("Input");
    const document: TextDocument = createTextDocument("xml", xmlText);
    const position: Position = document.positionAt(offset);
    return { document, position };
  }

  function createTextDocument(
    languageId: string,
    content: string
  ): TextDocument {
    return TextDocument.create("uri", languageId, 0, content);
  }
});
