import { expect } from "chai";
import { find } from "lodash";
import { parse, DocumentCstNode } from "@xml-tools/parser";
import { buildAst, XMLElement, XMLAttribute } from "@xml-tools/ast";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { generate } from "@ui5-language-assistant/semantic-model";
import {
  generateModel,
  expectExists,
} from "@ui5-language-assistant/test-utils";
import {
  getUI5ClassByXMLElement,
  getUI5AggregationByXMLElement,
  getUI5PropertyByXMLAttributeKey,
  ui5NodeToFQN,
  getUI5NodeFromXMLElementNamespace,
  getUI5ClassByXMLElementClosingTag,
  getUI5NodeByXMLAttribute,
} from "../../src/api";

describe("The @ui5-language-assistant/logic-utils <getUI5ClassByXMLElement> function", () => {
  let ui5Model: UI5SemanticModel;
  before(async () => {
    ui5Model = await generateModel({
      framework: "SAPUI5",
      version: "1.71.49",
      modelGenerator: generate,
    });
  });

  it("returns the class for class in the default namespace", () => {
    const xmlText = `
        <View xmlns="sap.ui.core.mvc">
        </View>`;
    const rootElement = getRootElement(xmlText);

    const ui5Class = getUI5ClassByXMLElement(rootElement, ui5Model);
    expectExists(ui5Class, "ui5 class");
    expect(ui5NodeToFQN(ui5Class)).to.equal("sap.ui.core.mvc.View");
  });

  it("returns the class for class in a named namespace", () => {
    const xmlText = `
        <mvc:View xmlns:mvc="sap.ui.core.mvc">
        </mvc:View>`;
    const rootElement = getRootElement(xmlText);

    const ui5Class = getUI5ClassByXMLElement(rootElement, ui5Model);
    expectExists(ui5Class, "ui5 class");
    expect(ui5NodeToFQN(ui5Class)).to.equal("sap.ui.core.mvc.View");
  });

  it("returns the class for class in a self-closing tag", () => {
    const xmlText = `
        <mvc:View xmlns:mvc="sap.ui.core.mvc" />`;
    const rootElement = getRootElement(xmlText);

    const ui5Class = getUI5ClassByXMLElement(rootElement, ui5Model);
    expectExists(ui5Class, "ui5 class");
    expect(ui5NodeToFQN(ui5Class)).to.equal("sap.ui.core.mvc.View");
  });

  it("returns undefined when the class name in unknown", () => {
    const xmlText = `
        <mvc:View1 xmlns:mvc="sap.ui.core.mvc">
        </mvc:View1>`;
    const rootElement = getRootElement(xmlText);

    const ui5Class = getUI5ClassByXMLElement(rootElement, ui5Model);
    expect(ui5Class, "ui5 class").to.be.undefined;
  });

  it("returns undefined when the namespace is undefined", () => {
    const xmlText = `
        <mvc:View xmlns:mvc1="sap.ui.core.mvc">
        </mvc:View>`;
    const rootElement = getRootElement(xmlText);

    const ui5Class = getUI5ClassByXMLElement(rootElement, ui5Model);
    expect(ui5Class, "ui5 class").to.be.undefined;
  });

  it("returns undefined when the namespace is unknown", () => {
    const xmlText = `
        <mvc:View xmlns:mvc="sap.ui.core.mvc1">
        </mvc:View>`;
    const rootElement = getRootElement(xmlText);

    const ui5Class = getUI5ClassByXMLElement(rootElement, ui5Model);
    expect(ui5Class, "ui5 class").to.be.undefined;
  });

  it("returns undefined when the class is not directly on the namespace", () => {
    const xmlText = `
        <core:mvc.View xmlns:core="sap.ui.core" xmlns:mvc="sap.ui.core.mvc">
        </mvc:View>`;
    const rootElement = getRootElement(xmlText);

    const ui5Class = getUI5ClassByXMLElement(rootElement, ui5Model);
    expect(ui5Class, "ui5 class").to.be.undefined;
  });
});

describe("The @ui5-language-assistant/logic-utils <getUI5ClassByXMLElementClosingTag> function", () => {
  let ui5Model: UI5SemanticModel;
  before(async () => {
    ui5Model = await generateModel({
      framework: "SAPUI5",
      version: "1.71.49",
      modelGenerator: generate,
    });
  });

  it("returns the class for class in the default namespace", () => {
    const xmlText = `
        <View_OPENING xmlns="sap.ui.core.mvc">
        </View>`;
    const rootElement = getRootElement(xmlText);

    const ui5Class = getUI5ClassByXMLElementClosingTag(rootElement, ui5Model);
    expectExists(ui5Class, "ui5 class");
    expect(ui5NodeToFQN(ui5Class)).to.equal("sap.ui.core.mvc.View");
  });

  it("returns the class for class in a named namespace", () => {
    const xmlText = `
        <mvc:View_OPENING xmlns:mvc="sap.ui.core.mvc">
        </mvc:View>`;
    const rootElement = getRootElement(xmlText);

    const ui5Class = getUI5ClassByXMLElementClosingTag(rootElement, ui5Model);
    expectExists(ui5Class, "ui5 class");
    expect(ui5NodeToFQN(ui5Class)).to.equal("sap.ui.core.mvc.View");
  });

  it("returns undefined when the class name in unknown", () => {
    const xmlText = `
        <mvc:View xmlns:mvc="sap.ui.core.mvc">
        </mvc:View_TYPO>`;
    const rootElement = getRootElement(xmlText);

    const ui5Class = getUI5ClassByXMLElementClosingTag(rootElement, ui5Model);
    expect(ui5Class, "ui5 class").to.be.undefined;
  });

  it("returns undefined when the namespace is undefined", () => {
    const xmlText = `
        <mvc:View xmlns:mvc="sap.ui.core.mvc">
        </mvc_TYPO:View>`;
    const rootElement = getRootElement(xmlText);

    const ui5Class = getUI5ClassByXMLElementClosingTag(rootElement, ui5Model);
    expect(ui5Class, "ui5 class").to.be.undefined;
  });

  it("returns undefined when the namespace is unknown", () => {
    const xmlText = `
        <mvc_ok:View xmlns:mvc="sap.ui.core.mvc_TYPO" xmlns:mvc_ok="sap.ui.core.mvc">
        </mvc:View>`;
    const rootElement = getRootElement(xmlText);

    const ui5Class = getUI5ClassByXMLElementClosingTag(rootElement, ui5Model);
    expect(ui5Class, "ui5 class").to.be.undefined;
  });

  it("returns undefined when the class is not directly on the namespace", () => {
    const xmlText = `
        <mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core">
        </core:mvc.View>`;
    const rootElement = getRootElement(xmlText);

    const ui5Class = getUI5ClassByXMLElementClosingTag(rootElement, ui5Model);
    expect(ui5Class, "ui5 class").to.be.undefined;
  });

  it("returns undefined for self-closing tag", () => {
    const xmlText = `
        <mvc:View xmlns:mvc="sap.ui.core.mvc" />`;
    const rootElement = getRootElement(xmlText);

    const ui5Class = getUI5ClassByXMLElementClosingTag(rootElement, ui5Model);
    expect(ui5Class, "ui5 class").to.be.undefined;
  });
});

describe("The @ui5-language-assistant/logic-utils <getUI5AggregationByXMLElement> function", () => {
  let ui5Model: UI5SemanticModel;
  before(async () => {
    ui5Model = await generateModel({
      framework: "SAPUI5",
      version: "1.71.49",
      modelGenerator: generate,
    });
  });

  it("returns the aggregation for known aggregation under a class tag", () => {
    const xmlText = `
        <View xmlns="sap.ui.core.mvc">
          <content></content>
        </View>`;
    const element = getRootElementChild(xmlText);

    const ui5Aggregation = getUI5AggregationByXMLElement(element, ui5Model);
    expectExists(ui5Aggregation, "ui5 aggregation");
    expect(ui5NodeToFQN(ui5Aggregation)).to.equal(
      "sap.ui.core.mvc.View.content"
    );
  });

  it("returns the aggregation for known aggregation under a class tag with namespace", () => {
    const xmlText = `
        <mvc:View xmlns:mvc="sap.ui.core.mvc">
          <mvc:content></mvc:content>
        </mvc:View>`;
    const element = getRootElementChild(xmlText);

    const ui5Aggregation = getUI5AggregationByXMLElement(element, ui5Model);
    expectExists(ui5Aggregation, "ui5 aggregation");
    expect(ui5NodeToFQN(ui5Aggregation)).to.equal(
      "sap.ui.core.mvc.View.content"
    );
  });

  it("returns the aggregation for known aggregation under a class tag with a different prefix that references the same namespace", () => {
    const xmlText = `
        <mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:mvc2="sap.ui.core.mvc">
          <mvc2:content></mvc2:content>
        </mvc:View>`;
    const element = getRootElementChild(xmlText);

    const ui5Aggregation = getUI5AggregationByXMLElement(element, ui5Model);
    expectExists(ui5Aggregation, "ui5 aggregation");
    expect(ui5NodeToFQN(ui5Aggregation)).to.equal(
      "sap.ui.core.mvc.View.content"
    );
  });

  it("returns undefined for unknown aggregation under a class tag", () => {
    const xmlText = `
        <View xmlns="sap.ui.core.mvc">
          <content1></content1>
        </View>`;
    const element = getRootElementChild(xmlText);

    const ui5Aggregation = getUI5AggregationByXMLElement(element, ui5Model);
    expect(ui5Aggregation, "ui5 aggregation").to.be.undefined;
  });

  it("returns undefined for tag under an unknown class", () => {
    const xmlText = `
        <View1 xmlns="sap.ui.core.mvc">
          <content></content>
        </View1>`;
    const element = getRootElementChild(xmlText);

    const ui5Aggregation = getUI5AggregationByXMLElement(element, ui5Model);
    expect(ui5Aggregation, "ui5 aggregation").to.be.undefined;
  });

  it("returns undefined for tag with unknown namespace under a class tag", () => {
    const xmlText = `
        <View xmlns="sap.ui.core.mvc">
          <ns:content></ns:content>
        </View>`;
    const element = getRootElementChild(xmlText);

    const ui5Aggregation = getUI5AggregationByXMLElement(element, ui5Model);
    expect(ui5Aggregation, "ui5 aggregation").to.be.undefined;
  });

  it("returns undefined for tag with known namespace under a class tag without namespace", () => {
    const xmlText = `
        <View xmlns="sap.ui.core.mvc" xmlns:core="sap.ui.core">
          <core:content></core:content>
        </View>`;
    const element = getRootElementChild(xmlText);

    const ui5Aggregation = getUI5AggregationByXMLElement(element, ui5Model);
    expect(ui5Aggregation, "ui5 aggregation").to.be.undefined;
  });

  it("returns undefined for tag with known namespace under a class tag with a different namespace", () => {
    const xmlText = `
        <mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core">
          <core:content></core:content>
        </mvc:View>`;
    const element = getRootElementChild(xmlText);

    const ui5Aggregation = getUI5AggregationByXMLElement(element, ui5Model);
    expect(ui5Aggregation, "ui5 aggregation").to.be.undefined;
  });

  it("returns undefined for tag with unknown namespace under a class tag with a different namespace", () => {
    const xmlText = `
        <mvc:View xmlns:mvc="sap.ui.core.mvc">
          <core:content></core:content>
        </mvc:View>`;
    const element = getRootElementChild(xmlText);

    const ui5Aggregation = getUI5AggregationByXMLElement(element, ui5Model);
    expect(ui5Aggregation, "ui5 aggregation").to.be.undefined;
  });

  it("returns undefined for tag with empty namespace under a class tag without a namespace", () => {
    const xmlText = `
        <View xmlns="sap.ui.core.mvc">
          <:content></:content>
        </View>`;
    const element = getRootElementChild(xmlText);

    const ui5Aggregation = getUI5AggregationByXMLElement(element, ui5Model);
    expect(ui5Aggregation, "ui5 aggregation").to.be.undefined;
  });

  it("returns undefined for non-aggregation node under a class tag", () => {
    const xmlText = `
        <View xmlns="sap.ui.core.mvc">
          <busy></busy>
        </View>`;
    const element = getRootElementChild(xmlText);

    const ui5Aggregation = getUI5AggregationByXMLElement(element, ui5Model);
    expect(ui5Aggregation, "ui5 aggregation").to.be.undefined;
  });

  it("returns undefined for root tag", () => {
    const xmlText = `
          <content></content>`;
    const element = getRootElement(xmlText);

    const ui5Aggregation = getUI5AggregationByXMLElement(element, ui5Model);
    expect(ui5Aggregation, "ui5 aggregation").to.be.undefined;
  });
});

describe("The @ui5-language-assistant/logic-utils <getUI5NodeByXMLAttribute> function", () => {
  let ui5Model: UI5SemanticModel;
  before(async () => {
    ui5Model = await generateModel({
      framework: "SAPUI5",
      version: "1.71.49",
      modelGenerator: generate,
    });
  });

  it("returns undefined for unknown class", () => {
    const xmlText = `
        <mvc:View1 xmlns:mvc="sap.ui.core.mvc" busy="true">
        </mvc:View1>`;
    const attribute = getRootElementAttribute(xmlText, "busy");

    const ui5Node = getUI5NodeByXMLAttribute(attribute, ui5Model);
    expect(ui5Node, "ui5 node").to.be.undefined;
  });

  it("returns undefined for non-ui5 attribute key", () => {
    const xmlText = `
        <mvc:View xmlns:mvc="sap.ui.core.mvc" busy1="true">
        </mvc:View>`;
    const attribute = getRootElementAttribute(xmlText, "busy1");

    const ui5Node = getUI5NodeByXMLAttribute(attribute, ui5Model);
    expect(ui5Node, "ui5 node").to.be.undefined;
  });

  it("returns the property for known attribute", () => {
    const xmlText = `
        <mvc:View xmlns:mvc="sap.ui.core.mvc" busy="true">
        </mvc:View>`;
    const attribute = getRootElementAttribute(xmlText, "busy");

    const prop = getUI5NodeByXMLAttribute(attribute, ui5Model);
    expectExists(prop, "ui5 property");
    expect(prop.kind).to.equal("UI5Prop");
    // "busy" is defined on Control
    expect(ui5NodeToFQN(prop)).to.equal("sap.ui.core.Control.busy");
  });

  it("returns the event for known attribute", () => {
    const xmlText = `
        <mvc:View xmlns:mvc="sap.ui.core.mvc" afterInit="dummy-text"
        </mvc:View>`;
    const attribute = getRootElementAttribute(xmlText, "afterInit");

    const event = getUI5NodeByXMLAttribute(attribute, ui5Model);
    expectExists(event, "ui5 event");
    expect(event.kind).to.equal("UI5Event");
    expect(ui5NodeToFQN(event)).to.equal("sap.ui.core.mvc.View.afterInit");
  });

  it("returns the association for known attribute", () => {
    const xmlText = `
        <mvc:View xmlns:m="sap.m" 
          xmlns:mvc="sap.ui.core.mvc">
          <m:Popover leftButton="dummy-text">
          </m:Popover>
        </mvc:View>`;

    const rootElement = getRootElement(xmlText);
    const popoverElement = find(
      rootElement.subElements,
      (_) => _.name === "Popover"
    );

    expectExists(popoverElement, `sub element 'Popover' of the root element`);
    const attribute = find(
      popoverElement.attributes,
      (_) => _.key === "leftButton"
    );

    expectExists(attribute, `attribute 'leftButton' of the 'Popover' element`);
    const association = getUI5NodeByXMLAttribute(attribute, ui5Model);
    expectExists(association, "ui5 association");
    expect(association.kind).to.equal("UI5Association");
    expect(ui5NodeToFQN(association)).to.equal("sap.m.Popover.leftButton");
  });

  it("returns the aggregation for known attribute", () => {
    const xmlText = `
        <mvc:View xmlns:mvc="sap.ui.core.mvc" content="dummy-text"
        </mvc:View`;
    const attribute = getRootElementAttribute(xmlText, "content");

    const aggregation = getUI5NodeByXMLAttribute(attribute, ui5Model);
    expectExists(aggregation, "ui5 aggregation");
    expect(aggregation.kind).to.equal("UI5Aggregation");
    expect(ui5NodeToFQN(aggregation)).to.equal("sap.ui.core.mvc.View.content");
  });
});

describe("The @ui5-language-assistant/logic-utils <getUI5PropertyByXMLAttributeKey> function", () => {
  let ui5Model: UI5SemanticModel;
  before(async () => {
    ui5Model = await generateModel({
      framework: "SAPUI5",
      version: "1.71.49",
      modelGenerator: generate,
    });
  });

  it("returns undefined for unknown class", () => {
    const xmlText = `
        <mvc:View1 xmlns:mvc="sap.ui.core.mvc" busy="true">
        </mvc:View1>`;
    const attribute = getRootElementAttribute(xmlText, "busy");

    const prop = getUI5PropertyByXMLAttributeKey(attribute, ui5Model);
    expect(prop, "ui5 property").to.be.undefined;
  });

  it("returns undefined for unknown property", () => {
    const xmlText = `
        <mvc:View xmlns:mvc="sap.ui.core.mvc" busy1="true">
        </mvc:View>`;
    const attribute = getRootElementAttribute(xmlText, "busy1");

    const prop = getUI5PropertyByXMLAttributeKey(attribute, ui5Model);
    expect(prop, "ui5 property").to.be.undefined;
  });

  it("returns undefined for non-property attribute", () => {
    const xmlText = `
        <mvc:View xmlns:mvc="sap.ui.core.mvc" formatError="true">
        </mvc:View>`;
    // formatError is an event, not a property
    const attribute = getRootElementAttribute(xmlText, "formatError");

    const prop = getUI5PropertyByXMLAttributeKey(attribute, ui5Model);
    expect(prop, "ui5 property").to.be.undefined;
  });

  it("returns the property for attribute with the property name without a namespace", () => {
    const xmlText = `
        <mvc:View xmlns:mvc="sap.ui.core.mvc" busy="true">
        </mvc:View>`;
    const attribute = getRootElementAttribute(xmlText, "busy");

    const prop = getUI5PropertyByXMLAttributeKey(attribute, ui5Model);
    expectExists(prop, "ui5 property");
    // "busy" is defined on Control
    expect(ui5NodeToFQN(prop)).to.equal("sap.ui.core.Control.busy");
  });

  it("returns undefined for attribute with a property name with a namespace", () => {
    const xmlText = `
        <mvc:View xmlns:mvc="sap.ui.core.mvc" mvc:busy="true">
        </mvc:View>`;
    const attribute = getRootElementAttribute(xmlText, "mvc:busy");

    const prop = getUI5PropertyByXMLAttributeKey(attribute, ui5Model);
    expect(prop, "ui5 property").to.be.undefined;
  });
});

describe("The @ui5-language-assistant/logic-utils <getUI5NodeFromXMLElementNamespace> function", () => {
  let ui5Model: UI5SemanticModel;
  before(async () => {
    ui5Model = await generateModel({
      framework: "SAPUI5",
      version: "1.71.49",
      modelGenerator: generate,
    });
  });

  it("returns the namespace for tag in a defined namespace", () => {
    const xmlText = `
        <mvc:View xmlns:mvc="sap.ui.core.mvc">
        </mvc:View>`;
    const rootElement = getRootElement(xmlText);

    const {
      namespace: ui5Node,
      isDefault,
      isXmlnsDefined,
    } = getUI5NodeFromXMLElementNamespace(rootElement, ui5Model);
    expect(isDefault).to.be.false;
    expect(isXmlnsDefined).to.be.true;
    expectExists(ui5Node, "ui5 namespace");
    expect(ui5NodeToFQN(ui5Node)).to.equal("sap.ui.core.mvc");
  });

  it("returns the namespace for tag in a defined namespace when namespace points to an enum", () => {
    const xmlText = `
        <mvc:View xmlns:mvc="sap.ui.core.BusyIndicatorSize">
        </mvc:View>`;
    const rootElement = getRootElement(xmlText);

    const {
      namespace: ui5Node,
      isDefault,
      isXmlnsDefined,
    } = getUI5NodeFromXMLElementNamespace(rootElement, ui5Model);
    expect(isDefault).to.be.false;
    expect(isXmlnsDefined).to.be.true;
    expectExists(ui5Node, "ui5 namespace");
    expect(ui5NodeToFQN(ui5Node)).to.equal("sap.ui.core.BusyIndicatorSize");
  });

  it("returns undefined for tag in a defined unknown namespace", () => {
    const xmlText = `
        <mvc:View xmlns:mvc="sap.ui.core.mvc1">
        </mvc:View>`;
    const rootElement = getRootElement(xmlText);

    const {
      namespace: ui5Node,
      isDefault,
      isXmlnsDefined,
    } = getUI5NodeFromXMLElementNamespace(rootElement, ui5Model);
    expect(isDefault).to.be.false;
    expect(isXmlnsDefined).to.be.true;
    expect(ui5Node, "ui5 namespace").to.be.undefined;
  });

  it("returns undefined for tag in an undefined namespace", () => {
    const xmlText = `
        <mvc:View>
        </mvc:View>`;
    const rootElement = getRootElement(xmlText);

    const {
      namespace: ui5Node,
      isDefault,
      isXmlnsDefined,
    } = getUI5NodeFromXMLElementNamespace(rootElement, ui5Model);
    expect(isDefault).to.be.false;
    expect(isXmlnsDefined).to.be.false;
    expect(ui5Node, "ui5 namespace").to.be.undefined;
  });

  it("returns the namespace for tag in the default namespace when default namespace is defined", () => {
    const xmlText = `
        <View xmlns="sap.ui.core.mvc">
        </View>`;
    const rootElement = getRootElement(xmlText);

    const {
      namespace: ui5Node,
      isDefault,
      isXmlnsDefined,
    } = getUI5NodeFromXMLElementNamespace(rootElement, ui5Model);
    expect(isDefault).to.be.true;
    expect(isXmlnsDefined).to.be.true;
    expectExists(ui5Node, "ui5 namespace");
    expect(ui5NodeToFQN(ui5Node)).to.equal("sap.ui.core.mvc");
  });

  it("returns the namespace for tag in the default namespace when default namespace is defined and unknown", () => {
    const xmlText = `
        <View xmlns="sap.ui.core.mvc1">
        </View>`;
    const rootElement = getRootElement(xmlText);

    const {
      namespace: ui5Node,
      isDefault,
      isXmlnsDefined,
    } = getUI5NodeFromXMLElementNamespace(rootElement, ui5Model);
    expect(isDefault).to.be.true;
    expect(isXmlnsDefined).to.be.true;
    expect(ui5Node, "ui5 namespace").to.be.undefined;
  });

  it("returns undefined for tag without a namespace when default namespace is not defined", () => {
    const xmlText = `
        <View>
        </View>`;
    const rootElement = getRootElement(xmlText);

    const {
      namespace: ui5Node,
      isDefault,
      isXmlnsDefined,
    } = getUI5NodeFromXMLElementNamespace(rootElement, ui5Model);
    expect(isDefault).to.be.true;
    expect(isXmlnsDefined).to.be.false;
    expect(ui5Node, "ui5 namespace").to.be.undefined;
  });
});

function getRootElement(xmlText: string): XMLElement {
  const { cst, tokenVector } = parse(xmlText);
  const ast = buildAst(cst as DocumentCstNode, tokenVector);
  expectExists(ast.rootElement, "ast root element");
  return ast.rootElement;
}

function getRootElementChild(xmlText: string): XMLElement {
  const rootElement = getRootElement(xmlText);
  const child = rootElement.subElements[0];
  expectExists(child, "root element first child");
  return child;
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
