import { getXMLViewIdDiagnostics } from "../../src/xml-view-diagnostics";
import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
} from "@ui5-language-assistant/test-framework";
import {
  Context,
  getContext,
  isContext,
  cache,
} from "@ui5-language-assistant/context";
import { join, basename } from "path";

describe("xml view diagnostics", () => {
  describe("adaptation project", () => {
    let framework: TestFramework;
    let context: Context;
    beforeAll(async () => {
      const useConfig: Config = {
        projectInfo: {
          name: ProjectName.adp,
          type: ProjectType.ADP,
          npmInstall: false,
        },
      };
      framework = new TestFramework(useConfig);
    });
    beforeEach(() => {
      // reset to avoid side effects
      cache.reset();
    });
    it("diagnostics for duplicate ids - no duplicate", async () => {
      // arrange
      const root = framework.getProjectRoot();
      const snippet = `
<!-- Use stable and unique IDs!-->
<core:FragmentDefinition xmlns:core='sap.ui.core' xmlns='sap.m'>
    <Text id="_IDGenText" >
    <Button id="_IDGenButton" />
</core:FragmentDefinition>`;
      const pathSegments = [
        "webapp",
        "changes",
        "fragments",
        "actionToolbar.fragment.xml",
      ];
      await framework.updateFile(pathSegments, snippet);
      const docPath = join(root, ...pathSegments);
      const ctx = await getContext(docPath);
      if (isContext(ctx)) {
        context = ctx;
      } else {
        throw new Error("Failed to build context....");
      }
      const { document } = framework.toVscodeTextDocument(
        framework.getFileUri(pathSegments),
        snippet,
        0
      );
      // act
      const result = getXMLViewIdDiagnostics({ document, context });
      // assert
      expect(result).toEqual([]);
    });
    it("diagnostics for duplicate ids - duplicates", async () => {
      // arrange
      const root = framework.getProjectRoot();
      const snippet = `
<!-- Use stable and unique IDs!-->
<core:FragmentDefinition xmlns:core='sap.ui.core' xmlns='sap.m'>
    <Text id="_IDGenText" >
    <Button id="_IDGenButton" />
</core:FragmentDefinition>`;
      const pathSegments = [
        "webapp",
        "changes",
        "fragments",
        "actionToolbar.fragment.xml",
      ];
      await framework.updateFile(pathSegments, snippet);
      const pathSegments02 = [
        "webapp",
        "changes",
        "fragments",
        "filterBar.fragment.xml",
      ];
      await framework.updateFile(pathSegments02, snippet);
      const docPath = join(root, ...pathSegments);
      const ctx = await getContext(docPath);
      if (isContext(ctx)) {
        context = ctx;
      } else {
        throw new Error("Failed to build context....");
      }
      const { document } = framework.toVscodeTextDocument(
        framework.getFileUri(pathSegments),
        snippet,
        0
      );
      // act
      const result = getXMLViewIdDiagnostics({ document, context });
      // adapt uri
      result.map((i) =>
        i.relatedInformation?.map((j) => {
          j.location.uri = basename(j.location.uri);
        })
      );
      // assert
      expect(result).toMatchSnapshot();
    });
  });
});
