import { flatMap } from "lodash";
import {
  XMLDocument,
  XMLAstVisitor,
  XMLAttribute,
  XMLElement,
} from "@xml-tools/ast";
import { AppContext } from "@ui5-language-assistant/semantic-model-types";
import { UI5XMLViewIssue } from "../api";

export interface UI5ValidatorsConfig {
  /**
   * Careful on abusing top level document validators.
   * If such validators need to traverse the whole AST there may
   * be performance implications.
   */
  document: ((
    xmlNode: XMLDocument,
    context: AppContext
  ) => UI5XMLViewIssue[])[];

  element: ((xmlNode: XMLElement, context: AppContext) => UI5XMLViewIssue[])[];

  attribute: ((
    xmlNode: XMLAttribute,
    context: AppContext
  ) => UI5XMLViewIssue[])[];
}

export class ValidatorVisitor implements XMLAstVisitor {
  public collectedIssues: UI5XMLViewIssue[] = [];

  constructor(
    private context: AppContext,
    private validators: UI5ValidatorsConfig
  ) {}

  visitXMLDocument(node: XMLDocument): void {
    const nodeIssues = flatMap(this.validators.document, (_) =>
      _(node, this.context)
    );
    this.collectedIssues = this.collectedIssues.concat(nodeIssues);
  }

  visitXMLElement(node: XMLElement): void {
    const nodeIssues = flatMap(this.validators.element, (_) =>
      _(node, this.context)
    );
    this.collectedIssues = this.collectedIssues.concat(nodeIssues);
  }

  visitXMLAttribute(node: XMLAttribute): void {
    const nodeIssues = flatMap(this.validators.attribute, (_) =>
      _(node, this.context)
    );
    this.collectedIssues = this.collectedIssues.concat(nodeIssues);
  }
}
