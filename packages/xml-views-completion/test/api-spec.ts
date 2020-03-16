import { expect } from "chai";
import { map, find } from "lodash";
import { XMLElement, buildAst } from "@xml-tools/ast";
import { parse, DocumentCstNode } from "@xml-tools/parser";

import {
  UI5Aggregation,
  UI5SemanticModel
} from "@ui5-editor-tools/semantic-model-types";
import { generateModel } from "@ui5-editor-tools/test-utils";

import { getXMLViewCompletions } from "../src/api";
import { XMLViewCompletion } from "../api";

const REAL_UI5_MODEL: UI5SemanticModel = generateModel("1.74.0");

describe("The `getXMLViewCompletions()` api", () => {
  it("will filter none public/protected suggestions", () => {
    const xmlSnippet = `
          <mvc:View
            xmlns="sap.ui.core">
            <XMLComposite>
              <⇶
            </XMLComposite>
          </mvc:View>`;

    const xmlCompositeClass =
      REAL_UI5_MODEL.classes["sap.ui.core.XMLComposite"];
    const _contentAggregation = find<UI5Aggregation>(
      xmlCompositeClass.aggregations,
      _ => _.name === "_content"
    ) as UI5Aggregation;
    expect(_contentAggregation).to.exist;
    expect(_contentAggregation.visibility).to.equal("hidden");

    testSuggestionsScenario({
      model: REAL_UI5_MODEL,
      xmlText: xmlSnippet,
      assertion: suggestions => {
        const suggestedNames = map(suggestions, _ => _.ui5Node.name);
        expect(suggestedNames).to.not.be.empty;
        expect(suggestedNames).to.not.include.members(["_content"]);
      }
    });
  });

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
