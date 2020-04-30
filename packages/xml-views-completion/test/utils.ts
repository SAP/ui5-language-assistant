import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { DocumentCstNode, parse } from "@xml-tools/parser";
import {
  buildAst,
  Prefix,
  Uri,
  XMLAttribute,
  XMLDocument,
  XMLElement
} from "@xml-tools/ast";
import { getSuggestions, SuggestionProviders } from "@xml-tools/content-assist";

import {
  UI5XMLViewCompletion,
  UI5NodeXMLViewCompletion,
  LiteralXMLViewCompletion
} from "../api";
import {
  isUI5NodeXMLViewCompletion,
  isLiteralXMLViewCompletion
} from "../src/api";
import { forEach } from "lodash";
import { expectTrue } from "@ui5-language-assistant/test-utils";

export function testSuggestionsScenario(opts: {
  xmlText: string;
  model: UI5SemanticModel;
  providers: SuggestionProviders<UI5XMLViewCompletion, UI5SemanticModel>;
  assertion: (x: UI5XMLViewCompletion[]) => void;
}): void {
  const realXmlText = opts.xmlText.replace("⇶", "");
  const offset = opts.xmlText.indexOf("⇶");
  const { cst, tokenVector } = parse(realXmlText);
  const ast = buildAst(cst as DocumentCstNode, tokenVector);
  const suggestions = getSuggestions<UI5XMLViewCompletion, UI5SemanticModel>({
    offset: offset,
    cst: cst as DocumentCstNode,
    ast: ast,
    tokenVector: tokenVector,
    context: opts.model,
    providers: opts.providers
  });

  opts.assertion(suggestions);
}

export function assertUI5Completions(
  suggestions: UI5XMLViewCompletion[]
): asserts suggestions is UI5NodeXMLViewCompletion[] {
  forEach(suggestions, _ => {
    expectTrue(
      isUI5NodeXMLViewCompletion(_),
      `Suggestion of type ${_.type} is not a UI5 node view completion`
    );
  });
}

export function asserLiteralCompletions(
  suggestions: UI5XMLViewCompletion[]
): asserts suggestions is LiteralXMLViewCompletion[] {
  forEach(suggestions, _ => {
    expectTrue(
      isLiteralXMLViewCompletion(_),
      `Suggesion of type ${_.type} is not a Literal view completion`
    );
  });
}

export function createXMLAttribute(
  xmlElementName: string,
  xmlAttributeKey: string | null,
  xmlAttributeValue: string | null,
  namespaces: Record<Prefix, Uri>
): XMLAttribute {
  const position = {
    startOffset: 1,
    startLine: 1,
    endColumn: 1,
    endLine: 1,
    endOffset: 1,
    startColumn: 1
  };
  const xmlDocument: XMLDocument = {
    position: position,
    rootElement: null,
    type: "XMLDocument"
  };
  const xmlElement: XMLElement = {
    attributes: [],
    name: xmlElementName,
    namespaces: namespaces,
    parent: xmlDocument,
    position: position,
    subElements: [],
    syntax: {},
    textContents: [],
    type: "XMLElement"
  };
  const xmlAttribute: XMLAttribute = {
    parent: xmlElement,
    syntax: {},
    position: position,
    value: xmlAttributeValue,
    type: "XMLAttribute",
    key: xmlAttributeKey
  };
  return xmlAttribute;
}
