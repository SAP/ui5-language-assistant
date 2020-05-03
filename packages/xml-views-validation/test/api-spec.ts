import { expect } from "chai";
import { map } from "lodash";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import {
  GEN_MODEL_TIMEOUT,
  generateModel
} from "@ui5-language-assistant/test-utils";
import { DocumentCstNode, parse } from "@xml-tools/parser";
import { buildAst } from "@xml-tools/ast";
import { validateXMLView } from "../src/api";

describe("the ui5 xml views validations API", () => {
  let ui5SemanticModel: UI5SemanticModel;

  before(async function() {
    this.timeout(GEN_MODEL_TIMEOUT);
    ui5SemanticModel = await generateModel({ version: "1.74.0" });
  });

  it("will detect semantic UI5 xml view issues (smoke)", () => {
    const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m"
            xmlns:commons="sap.ui.commons">
            >            
            <!-- Inner💩 is not a valid value for 'showSeparators' enum -->
            <List showSeparators = "Inner💩">
            </List>
            <!-- This sap.ui.commons.Button class is deprecated -->
            <commons:Button/>
          </mvc:View>`;

    const { cst, tokenVector } = parse(xmlSnippet);
    const ast = buildAst(cst as DocumentCstNode, tokenVector);

    const issues = validateXMLView({ model: ui5SemanticModel, xmlView: ast });
    expect(issues).to.have.lengthOf(2);
    const issueTypes = map(issues, _ => _.kind);
    expect(issueTypes).to.include.members([
      "UnknownEnumValue",
      "UseOfDeprecatedClass"
    ]);
  });
});
