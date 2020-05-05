import { flatMap } from "lodash";
import {
  XMLDocument,
  XMLAstVisitor,
  XMLAttribute,
  XMLElement,
  accept
} from "@xml-tools/ast";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { UI5XMLViewIssue } from "../api";

export interface UI5Validators {
  element: ((
    xmlNode: XMLElement,
    model: UI5SemanticModel
  ) => UI5XMLViewIssue[])[];
  attribute: ((
    xmlNode: XMLAttribute,
    model: UI5SemanticModel
  ) => UI5XMLViewIssue[])[];
}

class ValidatorVisitor implements XMLAstVisitor {
  public collectedIssues: UI5XMLViewIssue[] = [];

  constructor(
    private model: UI5SemanticModel,
    private validators: UI5Validators
  ) {}

  visitXMLElement(node: XMLElement): void {
    const nodeIssues = flatMap(this.validators.element, _ =>
      _(node, this.model)
    );
    this.collectedIssues = this.collectedIssues.concat(nodeIssues);
  }

  visitXMLAttribute(node: XMLAttribute): void {
    const nodeIssues = flatMap(this.validators.attribute, _ =>
      _(node, this.model)
    );
    this.collectedIssues = this.collectedIssues.concat(nodeIssues);
  }
}

export function validateXMLView(opts: {
  validators: UI5Validators;
  model: UI5SemanticModel;
  xmlView: XMLDocument;
}): UI5XMLViewIssue[] {
  const validatorVisitor = new ValidatorVisitor(opts.model, opts.validators);
  accept(opts.xmlView, validatorVisitor);
  const issues = validatorVisitor.collectedIssues;
  return issues;
}
