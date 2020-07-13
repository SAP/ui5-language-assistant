import { expect } from "chai";
import { map } from "lodash";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { generateModel } from "@ui5-language-assistant/test-utils";
import { generate } from "@ui5-language-assistant/semantic-model";
import { DocumentCstNode, parse } from "@xml-tools/parser";
import { buildAst } from "@xml-tools/ast";
import { validateXMLView } from "../src/api";

describe("the ui5 xml views validations API", () => {
  let ui5SemanticModel: UI5SemanticModel;

  before(async () => {
    ui5SemanticModel = await generateModel({
      version: "1.74.0",
      modelGenerator: generate,
    });
  });

  it("will detect semantic UI5 xml view issues (smoke)", () => {
    const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m"
            xmlns:commons="sap.ui.commons">
            >            
            <!-- TYPO💩 is not a valid value for 'showSeparators' enum -->
            <List showSeparators = "TYPO💩">
            </List>
            <!-- This sap.ui.commons.Button class is deprecated -->
            <commons:Button/>
          </mvc:View>`;

    const { cst, tokenVector } = parse(xmlSnippet);
    const ast = buildAst(cst as DocumentCstNode, tokenVector);

    const issues = validateXMLView({
      model: ui5SemanticModel,
      xmlView: ast,
      flexEnabled: false,
    });
    expect(issues).to.have.lengthOf(2);
    const issueTypes = map(issues, (_) => _.kind);
    expect(issueTypes).to.include.members([
      "UnknownEnumValue",
      "UseOfDeprecatedClass",
    ]);
  });

  it("will detect semantic UI5 xml view issues (smoke) when flexEnabled is true", () => {
    const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m"
            xmlns:commons="sap.ui.commons">
            >            
            <!-- TYPO💩 is not a valid value for 'showSeparators' enum -->
            <List showSeparators = "TYPO💩">
            </List>
            <!-- This sap.ui.commons.Button class is deprecated -->
            <commons:Button/>
          </mvc:View>`;

    const { cst, tokenVector } = parse(xmlSnippet);
    const ast = buildAst(cst as DocumentCstNode, tokenVector);

    const issues = validateXMLView({
      model: ui5SemanticModel,
      xmlView: ast,
      flexEnabled: true,
    });
    expect(issues).to.have.lengthOf(4);
    const issueTypes = map(issues, (_) => _.kind);
    expect(issueTypes).to.include.members([
      "NonStableIDIssue",
      "UnknownEnumValue",
      "UseOfDeprecatedClass",
    ]);
  });
});
