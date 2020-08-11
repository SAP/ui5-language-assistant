import { isEmpty } from "lodash";
import { expect } from "chai";
import { DocumentCstNode, parse } from "@xml-tools/parser";
import { buildAst } from "@xml-tools/ast";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { OffsetRange } from "@ui5-language-assistant/logic-utils";
import { UI5ValidatorsConfig } from "../src/validate-xml-views";
import { UI5XMLViewIssue } from "../api";
import { validateXMLView } from "../src/api";

const START_RANGE_MARKER = "🢂";
const END_RANGE_MARKER = "🢀";

export function testValidationsScenario(opts: {
  xmlText: string;
  model: UI5SemanticModel;
  validators: Partial<UI5ValidatorsConfig>;
  assertion: (issues: UI5XMLViewIssue[]) => void;
}): void {
  if (
    isEmpty(opts.validators.attribute) &&
    isEmpty(opts.validators.element) &&
    isEmpty(opts.validators.document)
  ) {
    throw new Error(
      "No validators provided, no relevant scenario can be tested in this manner!"
    );
  }

  const rangeMarkersRegExp = new RegExp(
    `[${START_RANGE_MARKER}${END_RANGE_MARKER}]`,
    "gu"
  );
  const xmlTextNoMarkers = opts.xmlText.replace(rangeMarkersRegExp, "");
  const { cst, tokenVector } = parse(xmlTextNoMarkers);
  const ast = buildAst(cst as DocumentCstNode, tokenVector);

  const issues = validateXMLView({
    validators: {
      document: [],
      element: [],
      attribute: [],
      ...opts.validators,
    },
    xmlView: ast,
    model: opts.model,
  });
  opts.assertion(issues);
}

export function computeExpectedRanges(markedXMLSnippet: string): OffsetRange[] {
  const expectedRanges = [];

  function previousMarkersOffset(): number {
    return (
      expectedRanges.length *
      (START_RANGE_MARKER.length + END_RANGE_MARKER.length)
    );
  }

  const markedRangeRegExp = new RegExp(
    `${START_RANGE_MARKER}(.+?)${END_RANGE_MARKER}`,
    "gu"
  );
  let match;
  // eslint-disable-next-line no-cond-assign
  while ((match = markedRangeRegExp.exec(markedXMLSnippet)) !== null) {
    const start = match.index - previousMarkersOffset();
    // Chevrotain ranges are inclusive (start) to exclusive (end)
    const end = start + match[1].length - 1;
    expectedRanges.push({ start, end });
  }
  return expectedRanges;
}

/**
 * Utility for common single range case.
 */
export function computeExpectedRange(markedXMLSnippet: string): OffsetRange {
  const allRanges = computeExpectedRanges(markedXMLSnippet);
  if (isEmpty(allRanges)) {
    throw Error("The XML Snippet has no marked issue ranges!");
  }
  return computeExpectedRanges(markedXMLSnippet)[0];
}

export function assertNoIssues(
  model: UI5SemanticModel,
  validators: Partial<UI5ValidatorsConfig>,
  xmlSnippet: string
): void {
  testValidationsScenario({
    model: model,
    xmlText: xmlSnippet,
    validators: validators,
    assertion: (issues) => {
      expect(issues).to.be.empty;
    },
  });
}

export function assertSingleIssue(
  model: UI5SemanticModel,
  validators: Partial<UI5ValidatorsConfig>,
  kind: string,
  severity: string,
  xmlSnippet: string,
  message: string
): void {
  testValidationsScenario({
    model: model,
    xmlText: xmlSnippet,
    validators: validators,
    assertion: (issues) => {
      expect(issues).to.deep.equal([
        {
          kind: kind,
          message: message,
          offsetRange: computeExpectedRange(xmlSnippet),
          severity: severity,
        },
      ]);
    },
  });
}
