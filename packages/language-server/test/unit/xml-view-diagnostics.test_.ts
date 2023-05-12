import { Diagnostic } from "vscode-languageserver";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { generateModel } from "@ui5-language-assistant/test-utils";
import { generate } from "@ui5-language-assistant/semantic-model";
import { Context as AppContext } from "@ui5-language-assistant/context";
import { getDefaultContext } from "./completion-items-utils";
import { getXMLViewDiagnostics } from "../../src/xml-view-diagnostics";
import { xmlSnippetToDocument } from "./testUtils";

export function getDiagnostics(
  xmlSnippet: string,
  context: AppContext
): Diagnostic[] {
  const { document } = xmlSnippetToDocument(xmlSnippet);
  return getXMLViewDiagnostics({ document, context });
}

describe("the UI5 language assistant xml view diagnostics service", () => {
  let ui5SemanticModel: UI5SemanticModel;
  let appContext: AppContext;
  beforeAll(async () => {
    ui5SemanticModel = await generateModel({
      framework: "SAPUI5",
      version: "1.108.2",
      modelGenerator: generate,
    });
    appContext = getDefaultContext(ui5SemanticModel);
  });

  describe("diagnostics", () => {
    it("will get annotation related diagnostics", () => {
      const xmlSnippet = `<mvc:View
                              xmlns:mvc="sap.ui.core.mvc"
                              
                              xmlns:macros="sap.fe.macros"
                              > 
                              <mvc:content>
                                <macros:Chart metaPath=""></Chart>
                              </mvc:content>
                            </mvc:View>`;
      const response = getDiagnostics(xmlSnippet, appContext);
      expect(response).toMatchInlineSnapshot(`
        Array [
          Object {
            "message": "Unknown namespace: \\"sap.fe.macros\\"",
            "range": Object {
              "end": Object {
                "character": 58,
                "line": 3,
              },
              "start": Object {
                "character": 43,
                "line": 3,
              },
            },
            "severity": 2,
            "source": "UI5 Language Assistant",
          },
        ]
      `);
    }, 100000);
  });
});
