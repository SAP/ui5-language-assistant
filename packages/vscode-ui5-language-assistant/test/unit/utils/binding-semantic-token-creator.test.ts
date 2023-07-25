import {
  getSemanticTokens,
  getTokenType,
  CustomSemanticToken,
} from "../../../src/utils";
import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
} from "@ui5-language-assistant/test-framework";
import { SemanticTokenTypes } from "vscode-languageserver-types";

describe("binding-semantic-token-creator", () => {
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
  const getContent = (binding: string) => `
<mvc:View
      xmlns="sap.m"
      xmlns:mvc="sap.ui.core.mvc">
      <Text id="test-id" text="${binding}"/>
</mvc:View>
  `;
  const getAggregationContent = (binding: string) => `
<mvc:View
      xmlns="sap.m"
      xmlns:mvc="sap.ui.core.mvc">
      <HeaderContainer id="test-id" content="${binding}"/>
</mvc:View>
  `;
  describe("getSemanticTokens", () => {
    it("get semantics token for curly", async () => {
      const content = getContent("{}");
      const result = await getSemanticTokens({ documentUri, content });
      const bracket = getTokenType(CustomSemanticToken.bracket);
      expect(result.filter((i) => i.tokenType === bracket).length).toEqual(2);
    });
    it("get semantics token for braces", async () => {
      const content = getContent("{parts: []}");
      const result = await getSemanticTokens({ documentUri, content });
      const bracket = getTokenType(CustomSemanticToken.bracket);
      expect(result.filter((i) => i.tokenType === bracket).length).toEqual(4);
    });
    it("get semantics token for curly as value", async () => {
      const content = getContent("{anyKey: {}}");
      const result = await getSemanticTokens({ documentUri, content });
      const bracket = getTokenType(CustomSemanticToken.bracket);
      expect(result.filter((i) => i.tokenType === bracket).length).toEqual(4);
    });

    it("get semantics token for string", async () => {
      const content = getContent("{path: 'some-value'}");
      const result = await getSemanticTokens({ documentUri, content });
      const tokenType = getTokenType(SemanticTokenTypes.string);
      const semanticResult = result.filter((i) => i.tokenType === tokenType);
      expect(semanticResult.length).toEqual(1);
    });
    it("get semantics token for number", async () => {
      const content = getContent("{anyKey: 123}");
      const result = await getSemanticTokens({ documentUri, content });
      const tokenType = getTokenType(SemanticTokenTypes.number);
      const semanticResult = result.filter((i) => i.tokenType === tokenType);
      expect(semanticResult.length).toEqual(1);
    });
    it("get semantics token for boolean", async () => {
      const content = getContent("{anyKey: true}");
      const result = await getSemanticTokens({ documentUri, content });
      const tokenType = getTokenType(CustomSemanticToken.boolean);
      const semanticResult = result.filter((i) => i.tokenType === tokenType);
      expect(semanticResult.length).toEqual(1);
    });
    it("get semantics token for null", async () => {
      const content = getContent("{anyKey: null}");
      const result = await getSemanticTokens({ documentUri, content });
      const tokenType = getTokenType(CustomSemanticToken.null);
      const semanticResult = result.filter((i) => i.tokenType === tokenType);
      expect(semanticResult.length).toEqual(1);
    });
    it("get semantics token for comma or colon [operator]", async () => {
      const content = getContent("{anyKey: null, anyKey02: true}");
      const result = await getSemanticTokens({ documentUri, content });
      const tokenType = getTokenType(SemanticTokenTypes.operator);
      const semanticResult = result.filter((i) => i.tokenType === tokenType);
      expect(semanticResult.length).toEqual(3);
    });
    it("test semantic tokens for property", async () => {
      const snippet = `
        {
          parts: [
            {value: 'formatWithBrackets'},
            {path: 'scholar/employeeNav/manager/displayName', targetType: 'any'},
            {
              path: 'scholar/employeeNav/manager_userID',
              type: 'sap.ui.model.odata.type.String',
              constraints: {maxLength: 255},
              formatOptions: {parseKeepsEmptyString: true}
            }
          ],
          formatter: 'sap.fe.core.formatters.ValueFormatter'
        }
      `;
      const content = getContent(snippet);
      const result = await getSemanticTokens({ documentUri, content });
      expect(result.length).toEqual(51);
      expect(result).toMatchSnapshot();
    });
    it("test semantic tokens for aggregation", async () => {
      const snippet = `
      {
        path:'/Travel', 
        parameters : {
            $filter : 'filter logic goes here',
            $orderby : 'TotalPrice desc'
        }
      }`;
      const content = getAggregationContent(snippet);
      const result = await getSemanticTokens({ documentUri, content });
      expect(result.length).toEqual(17);
      expect(result).toMatchSnapshot();
    });
    describe("no semantic token", () => {
      it("undefined root element [!ast.rootElement]", async () => {
        const result = await getSemanticTokens({
          documentUri,
          content: "<ab></ab>",
        });
        expect(result.length).toEqual(0);
      });
      it("not ui5 node", async () => {
        const content = `
<mvc:View
      xmlns="sap.m"
      xmlns:mvc="sap.ui.core.mvc">
      <Text id="test-id" ABC="{path: 'some-value'}"/>
</mvc:View>
  `;
        const result = await getSemanticTokens({
          documentUri,
          content,
        });
        expect(result.length).toEqual(0);
      });
      it("binding expression", async () => {
        const content = getContent("{:= some-binding-expression }");
        const result = await getSemanticTokens({ documentUri, content });
        expect(result.length).toEqual(0);
      });
      it("not allowed binding", async () => {
        const content = getContent("{path}");
        const result = await getSemanticTokens({ documentUri, content });
        expect(result.length).toEqual(0);
      });
      it("not xml view", async () => {
        const content = getContent("{path: 'someValue'}");
        const result = await getSemanticTokens({
          documentUri: "not-a-view-file",
          content,
        });
        expect(result.length).toEqual(0);
      });
    });
  });
});
