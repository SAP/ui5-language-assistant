import { AppContext } from "@ui5-language-assistant/semantic-model-types";
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

import { UI5XMLViewCompletion } from "../api";
import {
  Config,
  ProjectName,
  ProjectType,
  TestUtils,
} from "@ui5-language-assistant/test-utils";

export function testSuggestionsScenario(opts: {
  xmlText: string;
  context: AppContext;
  providers: SuggestionProviders<UI5XMLViewCompletion, AppContext>;
  assertion: (x: UI5XMLViewCompletion[]) => void;
}): void {
  const realXmlText = opts.xmlText.replace("⇶", "");
  const offset = opts.xmlText.indexOf("⇶");
  const { cst, tokenVector } = parse(realXmlText);
  const ast = buildAst(cst as DocumentCstNode, tokenVector);
  const suggestions = getSuggestions<UI5XMLViewCompletion, AppContext>({
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

export const getSuggestionsScenario = (
  config?: Config,
  modelCachePath?: string
) => {
  const useConfig: Config = config ?? {
    projectInfo: {
      name: ProjectName.cap,
      type: ProjectType.cap,
      npmInstall: true,
    },
  };
  const testUtils = new TestUtils(useConfig);
  const useModelCachePath = modelCachePath ?? testUtils.getModelCachePath();
  const run = async (
    content: string,
    providers: SuggestionProviders<UI5XMLViewCompletion, AppContext>,
    pathSegments?: string[]
  ): Promise<UI5XMLViewCompletion[]> => {
    const usePathSegments = pathSegments ?? [
      "app",
      "manage_travels",
      "webapp",
      "ext",
      "main",
      "Main.view.xml",
    ];
    await testUtils.updateFile(usePathSegments, content);
    const { ast, cst, offset, tokenVector } = await testUtils.readFile(
      usePathSegments
    );
    const fileUri = testUtils.getFileUri(usePathSegments);
    const context = await testUtils.getContextForFile(
      fileUri,
      useModelCachePath
    );
    return getSuggestions<UI5XMLViewCompletion, AppContext>({
      offset,
      cst,
      ast,
      tokenVector,
      context,
      providers,
    });
  };
  return { testUtils, run };
};
