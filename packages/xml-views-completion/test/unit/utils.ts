import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { DocumentCstNode, parse } from "@xml-tools/parser";
import {
  buildAst,
  Prefix,
  Uri,
  XMLAttribute,
  XMLDocument,
  XMLElement,
} from "@xml-tools/ast";
import { getSuggestions, SuggestionProviders } from "@xml-tools/content-assist";

import { UI5XMLViewCompletion } from "../../api";
import { Context } from "@ui5-language-assistant/context";
import { DEFAULT_UI5_FRAMEWORK } from "@ui5-language-assistant/constant";

export function testSuggestionsScenario(opts: {
  xmlText: string;
  context: Context;
  providers: SuggestionProviders<UI5XMLViewCompletion, Context>;
  assertion: (x: UI5XMLViewCompletion[]) => void;
}): void {
  const realXmlText = opts.xmlText.replace("⇶", "");
  const offset = opts.xmlText.indexOf("⇶");
  const { cst, tokenVector } = parse(realXmlText);
  const ast = buildAst(cst as DocumentCstNode, tokenVector);
  const suggestions = getSuggestions<UI5XMLViewCompletion, Context>({
    offset: offset,
    cst: cst as DocumentCstNode,
    ast: ast,
    tokenVector: tokenVector,
    context: opts.context,
    providers: opts.providers,
  });

  opts.assertion(suggestions);
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
    startColumn: 1,
  };
  const xmlDocument: XMLDocument = {
    position: position,
    rootElement: null,
    type: "XMLDocument",
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
    type: "XMLElement",
  };
  const xmlAttribute: XMLAttribute = {
    parent: xmlElement,
    syntax: {},
    position: position,
    value: xmlAttributeValue,
    type: "XMLAttribute",
    key: xmlAttributeKey,
  };
  return xmlAttribute;
}

export const getDefaultContext = (ui5Model: UI5SemanticModel): Context => {
  return {
    ui5Model,
    customViewId: "",
    manifestDetails: {
      appId: "",
      manifestPath: "",
      flexEnabled: false,
      customViews: {},
      mainServicePath: undefined,
      minUI5Version: undefined,
    },
    services: {},
    yamlDetails: {
      framework: DEFAULT_UI5_FRAMEWORK,
      version: undefined,
    },
    viewFiles: {},
    controlIds: new Map(),
    documentPath: "",
  };
};
