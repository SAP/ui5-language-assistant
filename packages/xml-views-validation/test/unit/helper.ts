import { join } from "path";
import type { UI5ValidatorsConfig, UI5XMLViewIssue } from "../../api";
import { TestFramework } from "@ui5-language-assistant/test-framework";
import { getContext } from "@ui5-language-assistant/context";
import type { Context } from "@ui5-language-assistant/context";
import { validateXMLView } from "@ui5-language-assistant/xml-views-validation";

export const getContent = (snippet: string): string => {
  return `<mvc:View xmlns:core="sap.ui.core"
    xmlns:mvc="sap.ui.core.mvc"
    xmlns:f="sap.f"
    xmlns="sap.m"
    xmlns:l="sap.ui.layout"
    xmlns:macros="sap.fe.macros"
    xmlns:html="http://www.w3.org/1999/xhtml" controllerName="sap.fe.demo.managetravels.ext.main.Main">
    <Page id="Main" title="Main">
        <content>${snippet}
        </content>
    </Page>
</mvc:View>
    `;
};

export const issueToSnapshot = (item: UI5XMLViewIssue): string =>
  `kind: ${item.kind}; text: ${item.message}; severity:${item.severity}; offsetRange:${item.offsetRange.start}-${item.offsetRange.end}`;

export type GetViewValidator = (snippet: string) => Promise<UI5XMLViewIssue[]>;
export const getViewValidator =
  (
    framework: TestFramework,
    viewFilePathSegments: string[],
    validators: UI5ValidatorsConfig<UI5XMLViewIssue>
  ): GetViewValidator =>
  async (snippet: string): Promise<UI5XMLViewIssue[]> => {
    await framework.updateFile(viewFilePathSegments, snippet);
    const root = framework.getProjectRoot();
    const documentPath = join(root, ...viewFilePathSegments);
    const { ast } = await framework.readFile(viewFilePathSegments);
    const context = (await getContext(documentPath)) as Context;
    return validateXMLView<UI5XMLViewIssue>({
      validators,
      context: context,
      xmlView: ast,
    });
  };
