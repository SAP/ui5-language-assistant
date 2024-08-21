import { parse, DocumentCstNode } from "@xml-tools/parser";
import { buildAst, XMLElement } from "@xml-tools/ast";
import { isPossibleCustomClass, isKnownUI5Class } from "../../src/api";
import {
  generateModel,
  getFallbackPatchVersions,
} from "@ui5-language-assistant/test-utils";
import { generate } from "@ui5-language-assistant/semantic-model";
import {
  DEFAULT_UI5_FRAMEWORK,
  DEFAULT_UI5_VERSION,
} from "@ui5-language-assistant/constant";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";

type XMLElementWithName = XMLElement & { name: string };
const getXmlElement = (content: string): XMLElementWithName => {
  const { cst, tokenVector } = parse(content);
  const ast = buildAst(cst as DocumentCstNode, tokenVector);
  return ast.rootElement as XMLElementWithName;
};

describe("isPossibleCustomClass", () => {
  it("should return true if the name of the XML element starts with an uppercase letter", () => {
    const xmlElement = getXmlElement("<Text />");
    const result = isPossibleCustomClass(xmlElement);
    expect(result).toBe(true);
  });

  it("should return false if the name of the XML element does not start with an uppercase letter", () => {
    const xmlElement = getXmlElement("<text />");
    const result = isPossibleCustomClass(xmlElement);
    expect(result).toBe(false);
  });
});

describe("isKnownUI5Class", () => {
  let model: UI5SemanticModel;
  beforeAll(async () => {
    model = await generateModel({
      framework: DEFAULT_UI5_FRAMEWORK,
      version: (
        await getFallbackPatchVersions()
      ).SAPUI5 as typeof DEFAULT_UI5_VERSION,
      modelGenerator: generate,
    });
  });
  it("should return true if the UI5 class for the XML element is known", () => {
    const content = `
    <mvc:View
        xmlns:mvc="sap.ui.core.mvc"
        xmlns="sap.m"
        >
        <Text></Text>
    </mvc:View> 
    `;
    const xmlElement = getXmlElement(content);
    const result = isKnownUI5Class(xmlElement, model);
    expect(result).toBe(true);
  });

  it("should return false if the UI5 class for the XML element is not known", () => {
    const xmlElement = getXmlElement("<text />");
    const result = isKnownUI5Class(xmlElement, model);
    expect(result).toBe(false);
  });
});
