import { expect } from "chai";
import {
  Config,
  ProjectName,
  ProjectType,
  TestUtils,
} from "@ui5-language-assistant/test-utils";
import { metaPathSuggestions } from "../../../src/providers/attributeValue/meta-path";

describe("The ui5-language-assistant xml-views-completion", () => {
  let testUtils: TestUtils;
  const segments = [
    "app",
    "manage_travels",
    "webapp",
    "ext",
    "main",
    "Main.view.xml",
  ];
  before(function () {
    const timeout = 5 * 60000 + 8000; // 5 min for initial npm install + 8 sec
    this.timeout(timeout);
    const config: Config = {
      projectInfo: {
        name: ProjectName.cap,
        type: ProjectType.cap,
        npmInstall: true,
      },
    };
    testUtils = new TestUtils(config);
  });
  context("macros:FilterBar", () => {
    context("metaPath", () => {
      it("code completion", async () => {
        const modelCachePath = testUtils.getModelCachePath();
        const content = `
        <mvc:View xmlns:core="sap.ui.core"
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.m"
          xmlns:macros="sap.fe.macros">
        <Page>
          <content>
            <HBox >
              <items>
                <macros:FilterBar metaPath="⇶"></macros:FilterBar>
              </items>
            </HBox>
          </content>
        </Page>
        </mvc:View>
        `;
        await testUtils.updateFile(segments, content);
        const { ast, cst, offset, tokenVector } = await testUtils.readFile(
          segments
        );
        const fileUri = testUtils.getFileUri(segments);
        const context = await testUtils.getContextForFile(
          fileUri,
          modelCachePath
        );
        const providers = {
          attributeValue: [metaPathSuggestions],
        };
        const suggestions = testUtils.getSuggestions({
          offset,
          cst,
          ast,
          tokenVector,
          context,
          providers,
        });
        expect(suggestions[0]?.ui5Node).to.deep.equal({
          kind: "AnnotationPath",
          name: "@com.sap.vocabularies.UI.v1.SelectionFields",
          value: "@com.sap.vocabularies.UI.v1.SelectionFields",
        });
      });
      it.skip("diagnostic");
    });
    context("contextPath", () => {
      it.skip("code completion");
      it.skip("diagnostic");
    });
  });
});
