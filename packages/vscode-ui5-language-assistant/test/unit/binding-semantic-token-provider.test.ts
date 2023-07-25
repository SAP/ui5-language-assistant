import { bindingSemanticTokensProvider } from "../../src/binding-semantic-token-provider";
import { TextDocument } from "vscode";

describe("binding-semantic-token-provider", () => {
  it("test provideDocumentSemanticTokens", async () => {
    const text = `
<mvc:View
      xmlns="sap.m"
      xmlns:mvc="sap.ui.core.mvc">
      <Text id="test-id" text="{path: 'some-value'}"/>
</mvc:View>`;
    const documents = {
      uri: "dummy-uri.view.xml",
      getText: () => text,
    } as unknown as TextDocument;
    const result =
      await bindingSemanticTokensProvider.provideDocumentSemanticTokens(
        documents
      );
    expect(result).toMatchSnapshot();
  });
});
