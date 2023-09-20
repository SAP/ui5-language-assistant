import { bindingSemanticTokensProvider } from "../../src/binding-semantic-token-provider";
import { TextDocument } from "vscode";
import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
} from "@ui5-language-assistant/test-framework";

describe("binding-semantic-token-provider", () => {
  let testFramework: TestFramework;
  let documentUri;
  const viewFilePathSegments = [
    "app",
    "manage_travels",
    "webapp",
    "ext",
    "main",
    "Main.view.xml",
  ];
  beforeAll(function () {
    const useConfig: Config = {
      projectInfo: {
        name: ProjectName.cap,
        type: ProjectType.CAP,
        npmInstall: false,
      },
    };
    testFramework = new TestFramework(useConfig);
    documentUri = testFramework.getFileUri(viewFilePathSegments);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
  it("test provideDocumentSemanticTokens", async () => {
    const text = `
<mvc:View
      xmlns="sap.m"
      xmlns:mvc="sap.ui.core.mvc">
      <Text id="test-id" text="{path: 'some-value'}"/>
</mvc:View>`;
    const documents = {
      uri: documentUri,
      getText: () => text,
    } as unknown as TextDocument;
    const result =
      await bindingSemanticTokensProvider.provideDocumentSemanticTokens(
        documents
      );
    expect(result).toMatchSnapshot();
  });
});
