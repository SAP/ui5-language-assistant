import { map, cloneDeep } from "lodash";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { DEFAULT_UI5_VERSION } from "@ui5-language-assistant/constant";
import {
  generateModel,
  getFallbackPatchVersions,
} from "@ui5-language-assistant/test-utils";
import { generate } from "@ui5-language-assistant/semantic-model";
import { DocumentCstNode, parse } from "@xml-tools/parser";
import { buildAst } from "@xml-tools/ast";
import { validateXMLView } from "../../src/api";
import { defaultValidators } from "../../src/api";
import { validateNonStableId } from "../../src/validators/elements/non-stable-id";
import { Context as AppContext } from "@ui5-language-assistant/context";
import { getDefaultContext } from "./test-utils";
import { isPossibleBindingAttributeValue } from "../../src/api";

describe("the ui5 xml views validations API", () => {
  let ui5SemanticModel: UI5SemanticModel;
  let appContext: AppContext;
  beforeAll(async () => {
    ui5SemanticModel = await generateModel({
      framework: "SAPUI5",
      version: (
        await getFallbackPatchVersions()
      ).SAPUI5 as typeof DEFAULT_UI5_VERSION,
      modelGenerator: generate,
    });
    appContext = getDefaultContext(ui5SemanticModel);
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
      validators: defaultValidators,
      context: appContext,
      xmlView: ast,
    });
    expect(issues).toHaveLength(2);
    const issueTypes = map(issues, (_) => _.kind);
    expect(issueTypes).toIncludeAllMembers([
      "UnknownEnumValue",
      "UseOfDeprecatedClass",
    ]);
  });

  it("will detect non stable ID issue", () => {
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
    const actualValidators = cloneDeep(defaultValidators);
    actualValidators.element.push(validateNonStableId);
    const issues = validateXMLView({
      validators: actualValidators,
      context: appContext,
      xmlView: ast,
    });
    expect(issues).toHaveLength(4);
    const issueTypes = map(issues, (_) => _.kind);
    expect(issueTypes).toIncludeAllMembers([
      "NonStableIDIssue",
      "UnknownEnumValue",
      "UseOfDeprecatedClass",
    ]);
  });

  it("just to cover exports", () => {
    const result = isPossibleBindingAttributeValue("test");
    expect(result).toBeFalse();
  });
});
