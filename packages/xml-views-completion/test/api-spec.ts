import { expect } from "chai";
import { find, map } from "lodash";
import { buildAst, XMLElement } from "@xml-tools/ast";
import { DocumentCstNode, parse } from "@xml-tools/parser";

import {
  UI5Aggregation,
  UI5SemanticModel
} from "@ui5-language-assistant/semantic-model-types";
import {
  generateModel,
  GEN_MODEL_TIMEOUT
} from "@ui5-language-assistant/test-utils";

import { getXMLViewCompletions } from "../src/api";
import { UI5XMLViewCompletion } from "../api";
import { assertUI5Completions } from "./utils";

describe("The `getXMLViewCompletions()` api", () => {
  let REAL_UI5_MODEL: UI5SemanticModel;

  before(async function() {
    this.timeout(GEN_MODEL_TIMEOUT);
    REAL_UI5_MODEL = await generateModel({ version: "1.74.0" });
  });

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
        assertUI5Completions(suggestions);
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
        assertUI5Completions(suggestions);
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
  assertion: (suggestions: UI5XMLViewCompletion[]) => void;
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
