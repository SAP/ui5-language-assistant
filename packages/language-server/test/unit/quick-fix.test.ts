import {
  generateModel,
  getFallbackPatchVersions,
} from "@ui5-language-assistant/test-utils";
import { Position, Range } from "vscode-languageserver-types";
import { generate } from "@ui5-language-assistant/semantic-model";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import {
  DEFAULT_UI5_FRAMEWORK,
  DEFAULT_UI5_VERSION,
} from "@ui5-language-assistant/constant";
import {
  QuickFixStableIdLSPInfo,
  diagnosticToCodeActionFix,
  executeQuickFixFileStableIdCommand,
  executeQuickFixStableIdCommand,
} from "../../src/quick-fix";
import { TextDocument } from "vscode-languageserver-textdocument";
import { getDefaultContext } from "./completion-items-utils";
import { Context } from "@ui5-language-assistant/context";
import { getXMLViewDiagnostics } from "../../src/xml-view-diagnostics";

let appContext: Context;

describe("The @ui5-language-assistant/language-server diagnostics quick fix function", () => {
  let ui5SemanticModel: UI5SemanticModel;
  beforeAll(async function () {
    ui5SemanticModel = await generateModel({
      framework: DEFAULT_UI5_FRAMEWORK,
      version: (
        await getFallbackPatchVersions()
      ).SAPUI5 as typeof DEFAULT_UI5_VERSION,
      modelGenerator: generate,
    });
    appContext = getDefaultContext(ui5SemanticModel);
    appContext.manifestDetails.flexEnabled = true;
  });

  describe("Quick fix code actions", () => {
    it("no quick fixable diagnostics", () => {
      const xmlSnippet = `<mvc:View xmlns:core="sap.ui.core" xmlns:uxap="sap.uxap" xmlns:m="sap.m"
      xmlns:mvc="sap.ui.core.mvc"
      xmlns="sap.ui.commons"
      xmlns:sap.ui.dt="sap.ui.dt">
      </mvc:View>`;

      const xmlTextDoc = TextDocument.create(`dummyUri`, "xml", 0, xmlSnippet);

      const response = diagnosticToCodeActionFix(
        xmlTextDoc,
        [
          {
            message: "",
            range: Range.create(Position.create(0, 0), Position.create(0, 10)),
          },
        ],
        appContext
      );

      expect(response).toBeEmpty();
    });

    it("will get code action", () => {
      const xmlSnippet = `<mvc:View xmlns:core="sap.ui.core" xmlns:uxap="sap.uxap" xmlns:m="sap.m"
      xmlns:mvc="sap.ui.core.mvc"
      xmlns="sap.ui.commons"
      xmlns:sap.ui.dt="sap.ui.dt">
          <m:CheckBox id="dummy-id"></m:CheckBox>
          <m:Button>
              <m:customData>
                  <core:CustomData></core:CustomData>
              </m:customData>
          </m:Button>
          <m:Panel sap.ui.dt:designtime="not-adaptable">
              <m:Dialog>
              </m:Dialog>
          </m:Panel>
      </mvc:View>`;

      const xmlTextDoc = TextDocument.create(`dummyUri`, "xml", 0, xmlSnippet);

      const actualDiagnostics = getXMLViewDiagnostics({
        document: xmlTextDoc,
        context: appContext,
      });
      const response = diagnosticToCodeActionFix(
        xmlTextDoc,
        actualDiagnostics,
        appContext
      );

      expect(response).toMatchSnapshot();
    });
  });

  it("excute Quick Fix Stable Id Command", () => {
    const response = executeQuickFixStableIdCommand({
      documentUri: "dummyUri",
      documentVersion: 1,
      quickFixReplaceRange: Range.create(
        Position.create(0, 0),
        Position.create(0, 10)
      ),
      quickFixNewText: "new text",
    });
    expect(response).toMatchInlineSnapshot(`
      Array [
        Object {
          "edits": Array [
            Object {
              "newText": "new text",
              "range": Object {
                "end": Object {
                  "character": 10,
                  "line": 0,
                },
                "start": Object {
                  "character": 0,
                  "line": 0,
                },
              },
            },
          ],
          "textDocument": Object {
            "uri": "dummyUri",
            "version": 1,
          },
        },
      ]
    `);
  });

  it("execute Quick Fix File Stable Id Command", () => {
    const issues: QuickFixStableIdLSPInfo[] = [
      {
        newText: "newText_1",
        replaceRange: {
          start: Position.create(0, 0),
          end: Position.create(0, 10),
        },
      },
      {
        newText: "newText_2",
        replaceRange: {
          start: Position.create(1, 0),
          end: Position.create(1, 10),
        },
      },
    ];
    const response = executeQuickFixFileStableIdCommand({
      documentUri: "dummyUri",
      documentVersion: 1,
      nonStableIdIssues: issues,
    });
    expect(response).toMatchInlineSnapshot(`
      Array [
        Object {
          "edits": Array [
            Object {
              "newText": "newText_1",
              "range": Object {
                "end": Object {
                  "character": 10,
                  "line": 0,
                },
                "start": Object {
                  "character": 0,
                  "line": 0,
                },
              },
            },
            Object {
              "newText": "newText_2",
              "range": Object {
                "end": Object {
                  "character": 10,
                  "line": 1,
                },
                "start": Object {
                  "character": 0,
                  "line": 1,
                },
              },
            },
          ],
          "textDocument": Object {
            "uri": "dummyUri",
            "version": 1,
          },
        },
      ]
    `);
  });
});
