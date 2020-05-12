import { expect } from "chai";
import { parse, DocumentCstNode } from "@xml-tools/parser";
import { buildAst, XMLElement, XMLAttribute } from "@xml-tools/ast";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import {
  generateModel,
  expectExists,
} from "@ui5-language-assistant/test-utils";
import {
  getClassByElement,
  getPropertyByAttributeKey,
  ui5NodeToFQN,
} from "../../src/api";
import { find } from "lodash";

describe("The @ui5-language-assistant/logic-utils <getClassByElement> function", () => {
  let ui5Model: UI5SemanticModel;
  before(async () => {
    ui5Model = await generateModel({ version: "1.74.0" });
  });

  it("returns the class for class in the default namespace", () => {
    const xmlText = `
        <View xmlns="sap.ui.core.mvc">
        </View>`;
    const rootElement = getRootElement(xmlText);

    const ui5Class = getClassByElement(rootElement, ui5Model);
    expectExists(ui5Class, "ui5 class");
    expect(ui5NodeToFQN(ui5Class)).to.equal("sap.ui.core.mvc.View");
  });

  it("returns the class for class in a named namespace", () => {
    const xmlText = `
        <mvc:View xmlns:mvc="sap.ui.core.mvc">
        </mvc:View>`;
    const rootElement = getRootElement(xmlText);

    const ui5Class = getClassByElement(rootElement, ui5Model);
    expectExists(ui5Class, "ui5 class");
    expect(ui5NodeToFQN(ui5Class)).to.equal("sap.ui.core.mvc.View");
  });

  it("returns undefined when the class name in unknown", () => {
    const xmlText = `
        <mvc:View1 xmlns:mvc="sap.ui.core.mvc">
        </mvc:View1>`;
    const rootElement = getRootElement(xmlText);

    const ui5Class = getClassByElement(rootElement, ui5Model);
    expect(ui5Class, "ui5 class").to.be.undefined;
  });

  it("returns undefined when the namespace is undefined", () => {
    const xmlText = `
        <mvc:View xmlns:mvc1="sap.ui.core.mvc">
        </mvc:View>`;
    const rootElement = getRootElement(xmlText);

    const ui5Class = getClassByElement(rootElement, ui5Model);
    expect(ui5Class, "ui5 class").to.be.undefined;
  });

  it("returns undefined when the namespace is unknown", () => {
    const xmlText = `
        <mvc:View xmlns:mvc="sap.ui.core.mvc1">
        </mvc:View>`;
    const rootElement = getRootElement(xmlText);

    const ui5Class = getClassByElement(rootElement, ui5Model);
    expect(ui5Class, "ui5 class").to.be.undefined;
  });
});

describe("The @ui5-language-assistant/logic-utils <getPropertyByAttributeKey> function", () => {
  let ui5Model: UI5SemanticModel;
  before(async () => {
    ui5Model = await generateModel({ version: "1.74.0" });
  });

  it("returns undefined for unknown class", () => {
    const xmlText = `
        <mvc:View1 xmlns:mvc="sap.ui.core.mvc" busy="true">
        </mvc:View1>`;
    const attribute = getRootElementAttribute(xmlText, "busy");

    const prop = getPropertyByAttributeKey(attribute, ui5Model);
    expect(prop, "ui5 property").to.be.undefined;
  });

  it("returns undefined for unknown property", () => {
    const xmlText = `
        <mvc:View xmlns:mvc="sap.ui.core.mvc" busy1="true">
        </mvc:View>`;
    const attribute = getRootElementAttribute(xmlText, "busy1");

    const prop = getPropertyByAttributeKey(attribute, ui5Model);
    expect(prop, "ui5 property").to.be.undefined;
  });

  it("returns undefined for non-property attribute", () => {
    const xmlText = `
        <mvc:View xmlns:mvc="sap.ui.core.mvc" formatError="true">
        </mvc:View>`;
    // formatError is an event, not a property
    const attribute = getRootElementAttribute(xmlText, "formatError");

    const prop = getPropertyByAttributeKey(attribute, ui5Model);
    expect(prop, "ui5 property").to.be.undefined;
  });

  it("returns the property for attribute with the property name without a namespace", () => {
    const xmlText = `
        <mvc:View xmlns:mvc="sap.ui.core.mvc" busy="true">
        </mvc:View>`;
    const attribute = getRootElementAttribute(xmlText, "busy");

    const prop = getPropertyByAttributeKey(attribute, ui5Model);
    expectExists(prop, "ui5 property");
    // "busy" is defined on Control
    expect(ui5NodeToFQN(prop)).to.equal("sap.ui.core.Control.busy");
  });

  it("returns undefined for attribute with a property name with a namespace", () => {
    const xmlText = `
        <mvc:View xmlns:mvc="sap.ui.core.mvc" mvc:busy="true">
        </mvc:View>`;
    const attribute = getRootElementAttribute(xmlText, "mvc:busy");

    const prop = getPropertyByAttributeKey(attribute, ui5Model);
    expect(prop, "ui5 property").to.be.undefined;
  });
});

function getRootElement(xmlText: string): XMLElement {
  const { cst, tokenVector } = parse(xmlText);
  const ast = buildAst(cst as DocumentCstNode, tokenVector);
  expectExists(ast.rootElement, "ast root element");
  return ast.rootElement;
}

function getRootElementAttribute(
  xmlText: string,
  attributeKey: string
): XMLAttribute {
  const rootElement = getRootElement(xmlText);
  const attribute = find(rootElement.attributes, (_) => _.key === attributeKey);
  expectExists(attribute, `attribute ${attributeKey} of the root element`);
  return attribute;
}
