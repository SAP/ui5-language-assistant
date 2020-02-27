import { expect } from "chai";
import { map } from "lodash";
import { XMLElement, buildAst } from "@xml-tools/ast";
import { parse, DocumentCstNode } from "@xml-tools/parser";

import { UI5SemanticModel } from "@vscode-ui5/semantic-model-types";
import { generateModel } from "@vscode-ui5/test-utils";

import { getXMLViewCompletions } from "../src/api";
import { XMLViewCompletion } from "../api";

// TODO: avoid generation multiple times in each test file
const REAL_UI5_MODEL: UI5SemanticModel = generateModel("1.74.0");

describe("The `getXMLViewCompletions()` api", () => {
  it("will provide suggestions for aggregations", () => {
    const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m">
            <Page>
              <⇶
            </Page>
          </mvc:View>`;

    testSuggestionsScenario({
      model: REAL_UI5_MODEL,
      xmlText: xmlSnippet,
      assertion: suggestions => {
        const suggestedNames = map(suggestions, _ => _.ui5Node.name);
        expect(suggestedNames).to.include.members([
          "content",
          "customHeader",
          "footer",
          "subHeader",
          "headerContent",
          "landmarkInfo",
          "tooltip",
          "customData",
          "layoutData",
          "dependents",
          "dragDropConfig"
        ]);

        const suggestedAstNode = suggestions[0].astNode as XMLElement;
        expect(suggestedAstNode.type).to.equal("XMLElement");
        expect((suggestedAstNode.parent as XMLElement).name).to.equal("Page");
      }
    });
  });
});

export function testSuggestionsScenario(opts: {
  xmlText: string;
  model: UI5SemanticModel;
  assertion: (x: XMLViewCompletion[]) => void;
}): void {
  const realXmlText = opts.xmlText.replace("⇶", "");
  const offset = opts.xmlText.indexOf("⇶");
  const { cst, tokenVector } = parse(realXmlText);
  const ast = buildAst(cst as DocumentCstNode, tokenVector);
  const suggestions = getXMLViewCompletions({
    offset: offset,
    cst: cst as DocumentCstNode,
    ast: ast,
    tokenVector: tokenVector,
    model: opts.model
  });

  opts.assertion(suggestions);
}
