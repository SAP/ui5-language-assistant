import { UI5SemanticModel } from "@ui5-editor-tools/semantic-model-types";
import { DocumentCstNode, parse } from "@xml-tools/parser";
import { buildAst } from "@xml-tools/ast";
import { getSuggestions, SuggestionProviders } from "@xml-tools/content-assist";

import { UI5XMLViewCompletion } from "../api";

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
