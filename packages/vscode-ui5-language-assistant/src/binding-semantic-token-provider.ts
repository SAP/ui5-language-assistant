import {
  TextDocument,
  SemanticTokens,
  SemanticTokensBuilder,
  DocumentSemanticTokensProvider,
  SemanticTokensLegend,
} from "vscode";
import { getSemanticTokens, tokenTypesLegend } from "./utils";

const tokenModifiersLegend = [];
export const bindingLegend = new SemanticTokensLegend(
  tokenTypesLegend,
  tokenModifiersLegend
);
class BindingSemanticTokensProvider implements DocumentSemanticTokensProvider {
  async provideDocumentSemanticTokens(
    document: TextDocument
  ): Promise<SemanticTokens> {
    const builder = new SemanticTokensBuilder();
    const documentUri = document.uri.toString();
    const semanticTokens = await getSemanticTokens({
      documentUri,
      content: document.getText(),
    });
    semanticTokens.forEach((item) =>
      builder.push(
        item.line,
        item.char,
        item.length,
        item.tokenType,
        item.tokenModifiers
      )
    );
    return builder.build();
  }
}

export const bindingSemanticTokensProvider =
  new BindingSemanticTokensProvider();
