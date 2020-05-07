import { isEmpty } from "lodash";
import { DocumentCstNode, parse } from "@xml-tools/parser";
import { buildAst } from "@xml-tools/ast";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import {
  UI5Validators,
  validateXMLView as validateXMLViewImpl,
} from "../src/validate-xml-views";
import { UI5XMLViewIssue } from "../api";

export function testValidationsScenario(opts: {
  xmlText: string;
  model: UI5SemanticModel;
  validators: Partial<UI5Validators>;
  assertion: (issues: UI5XMLViewIssue[]) => void;
}): void {
  if (isEmpty(opts.validators.attribute) && isEmpty(opts.validators.element)) {
    throw new Error(
      "No validators provided, no relevant scenario can be tested in this manner!"
    );
  }

  const { cst, tokenVector } = parse(opts.xmlText);
  const ast = buildAst(cst as DocumentCstNode, tokenVector);

  const issues = validateXMLViewImpl({
    validators: { element: [], attribute: [], ...opts.validators },
    xmlView: ast,
    model: opts.model,
  });
  opts.assertion(issues);
}
