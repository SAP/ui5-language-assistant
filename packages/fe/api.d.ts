import { UI5ValidatorsConfig } from "@ui5-language-assistant/xml-views-validation";
import type { Context } from "@ui5-language-assistant/context";

export {} from "./src/api";
export type {} from "./src/types";
export type {} from "@sap-ux/project-access";
export type { AnnotationIssue } from "./src/types/issues";

export declare const defaultValidators: UI5ValidatorsConfig<AnnotationIssue>;

export function getCompletionItems(opts: {
  context: Context;
  textDocumentPosition: TextDocumentPositionParams;
  document: TextDocument;
  documentSettings: Settings;
  cst: CstNode;
  tokenVector: IToken[];
  ast: XMLDocument;
}): CompletionItem[];
export function isAnnotationIssue<T extends BaseUI5XMLViewIssue>(
  issue: AnnotationIssue | T
): issue is AnnotationIssue;
