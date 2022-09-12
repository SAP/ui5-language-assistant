import { expect } from "chai";
import { DocumentCstNode, parse } from "@xml-tools/parser";
import { buildAst, XMLElement } from "@xml-tools/ast";

import { xmlToFQN, xmlClosingTagToFQN } from "../../src/api";

describe("The @ui5-language-assistant/logic-utils <xmlToFQN> function", () => {
  describe("will return the fully qualified name of an XML tag", () => {
    it("without any xmlns", () => {
      const xmlText = `
          <note>
            <to>Tove</to>
            <from>Jani</from>
            <heading>Reminder</heading_CLOSING>
            <body>Don't forget me this weekend!</body>
          </note>`;
      const { cst, tokenVector } = parse(xmlText);
      const ast = buildAst(cst as DocumentCstNode, tokenVector);
      const xmlHeadingTag = (ast.rootElement as XMLElement).subElements[2];
      const xmlTagFqn = xmlToFQN(xmlHeadingTag);
      expect(xmlTagFqn).to.eql("heading");
    });

    it("with default (implicit) xmlns", () => {
      const xmlText = `
          <note xmlns="foo.bar">
            <to>Tove</to>
            <from>Jani</from>
            <heading>Reminder</heading_CLOSING>
            <body>Don't forget me this weekend!</body>
          </note>`;
      const { cst, tokenVector } = parse(xmlText);
      const ast = buildAst(cst as DocumentCstNode, tokenVector);
      const xmlHeadingTag = (ast.rootElement as XMLElement).subElements[2];
      const xmlTagFqn = xmlToFQN(xmlHeadingTag);
      expect(xmlTagFqn).to.eql("foo.bar.heading");
    });

    it("with explicit xmlns prefix", () => {
      const xmlText = `
          <note xmlns:core="foo.bar">
            <to>Tove</to>
            <from>Jani</from>
            <core:heading>Reminder</core:heading_CLOSING>
            <body>Don't forget me this weekend!</body>
          </note>`;
      const { cst, tokenVector } = parse(xmlText);
      const ast = buildAst(cst as DocumentCstNode, tokenVector);
      const xmlHeadingTag = (ast.rootElement as XMLElement).subElements[2];
      const xmlTagFqn = xmlToFQN(xmlHeadingTag);
      expect(xmlTagFqn).to.eql("foo.bar.heading");
    });

    it("with an XMLTag lacking a name", () => {
      const xmlText = `
          <note>
            <to>Tove</to>
            <from>Jani</from>
            <
            <body>Don't forget me this weekend!</body>
          </note>`;
      const { cst, tokenVector } = parse(xmlText);
      const ast = buildAst(cst as DocumentCstNode, tokenVector);
      const xmlHeadingTag = (ast.rootElement as XMLElement).subElements[2];
      const xmlTagFqn = xmlToFQN(xmlHeadingTag);
      expect(xmlTagFqn).to.eql("");
    });
  });
});

describe("The @ui5-language-assistant/logic-utils <xmlClosingTagToFQN> function", () => {
  describe("will return the fully qualified name of an XML Element closing tag", () => {
    it("without any xmlns", () => {
      const xmlText = `
          <note>
            <to>Tove</to>
            <from>Jani</from>
            <heading_OPENING>Reminder</heading>
            <body>Don't forget me this weekend!</body>
          </note>`;
      const { cst, tokenVector } = parse(xmlText);
      const ast = buildAst(cst as DocumentCstNode, tokenVector);
      const xmlHeadingTag = (ast.rootElement as XMLElement).subElements[2];
      const xmlTagFqn = xmlClosingTagToFQN(xmlHeadingTag);
      expect(xmlTagFqn).to.eql("heading");
    });

    it("with default (implicit) xmlns", () => {
      const xmlText = `
          <note xmlns="foo.bar">
            <to>Tove</to>
            <from>Jani</from>
            <heading_OPENING>Reminder</heading>
            <body>Don't forget me this weekend!</body>
          </note>`;
      const { cst, tokenVector } = parse(xmlText);
      const ast = buildAst(cst as DocumentCstNode, tokenVector);
      const xmlHeadingTag = (ast.rootElement as XMLElement).subElements[2];
      const xmlTagFqn = xmlClosingTagToFQN(xmlHeadingTag);
      expect(xmlTagFqn).to.eql("foo.bar.heading");
    });

    it("with default (implicit) xmlns when opening tag has another namespace", () => {
      const xmlText = `
          <note xmlns="foo.bar" xmlns:core="other.ns">
            <to>Tove</to>
            <from>Jani</from>
            <core:heading_OPENING>Reminder</heading>
            <body>Don't forget me this weekend!</body>
          </note>`;
      const { cst, tokenVector } = parse(xmlText);
      const ast = buildAst(cst as DocumentCstNode, tokenVector);
      const xmlHeadingTag = (ast.rootElement as XMLElement).subElements[2];
      const xmlTagFqn = xmlClosingTagToFQN(xmlHeadingTag);
      expect(xmlTagFqn).to.eql("foo.bar.heading");
    });

    it("with explicit xmlns prefix", () => {
      const xmlText = `
          <note xmlns:core="foo.bar">
            <to>Tove</to>
            <from>Jani</from>
            <core:heading_OPENING>Reminder</core:heading>
            <body>Don't forget me this weekend!</body>
          </note>`;
      const { cst, tokenVector } = parse(xmlText);
      const ast = buildAst(cst as DocumentCstNode, tokenVector);
      const xmlHeadingTag = (ast.rootElement as XMLElement).subElements[2];
      const xmlTagFqn = xmlClosingTagToFQN(xmlHeadingTag);
      expect(xmlTagFqn).to.eql("foo.bar.heading");
    });

    it("with explicit xmlns prefix when opening tag has another namespace", () => {
      const xmlText = `
          <note xmlns:core="foo.bar" xmlns:abc="abc">
            <to>Tove</to>
            <from>Jani</from>
            <abc:heading_OPENING>Reminder</core:heading>
            <body>Don't forget me this weekend!</body>
          </note>`;
      const { cst, tokenVector } = parse(xmlText);
      const ast = buildAst(cst as DocumentCstNode, tokenVector);
      const xmlHeadingTag = (ast.rootElement as XMLElement).subElements[2];
      const xmlTagFqn = xmlClosingTagToFQN(xmlHeadingTag);
      expect(xmlTagFqn).to.eql("foo.bar.heading");
    });

    it("with an XMLTag lacking a name", () => {
      const xmlText = `
          <note>
            <to>Tove</to>
            <from>Jani</from>
            <
            <body>Don't forget me this weekend!</body>
          </note>`;
      const { cst, tokenVector } = parse(xmlText);
      const ast = buildAst(cst as DocumentCstNode, tokenVector);
      const xmlHeadingTag = (ast.rootElement as XMLElement).subElements[2];
      const xmlTagFqn = xmlClosingTagToFQN(xmlHeadingTag);
      expect(xmlTagFqn).to.eql("");
    });

    it("with an XMLTag lacking a closing tag", () => {
      const xmlText = `
          <note>
            <to>Tove</to>
            <from>Jani</from>
            <heading_OPENING />
            <body>Don't forget me this weekend!</body>
          </note>`;
      const { cst, tokenVector } = parse(xmlText);
      const ast = buildAst(cst as DocumentCstNode, tokenVector);
      const xmlHeadingTag = (ast.rootElement as XMLElement).subElements[2];
      const xmlTagFqn = xmlClosingTagToFQN(xmlHeadingTag);
      expect(xmlTagFqn).to.eql("");
    });
  });
});
