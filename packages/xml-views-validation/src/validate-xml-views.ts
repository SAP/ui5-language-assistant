import { flatMap } from "lodash";
import {
  XMLDocument,
  XMLAstVisitor,
  XMLAttribute,
  XMLElement,
} from "@xml-tools/ast";
import { UI5XMLViewIssue } from "../api";
import { Context } from "@ui5-language-assistant/context";

export interface UI5ValidatorsConfig<IssueType = UI5XMLViewIssue> {
  /**
   * Careful on abusing top level document validators.
   * If such validators need to traverse the whole AST there may
   * be performance implications.
   */
  document: ((xmlNode: XMLDocument, context: Context) => IssueType[])[];

  element: ((xmlNode: XMLElement, context: Context) => IssueType[])[];

  attribute: ((xmlNode: XMLAttribute, context: Context) => IssueType[])[];
}

export class ValidatorVisitor<IssueType> implements XMLAstVisitor {
  public collectedIssues: IssueType[] = [];

  constructor(
    private context: Context,
    private validators: UI5ValidatorsConfig<IssueType>
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
