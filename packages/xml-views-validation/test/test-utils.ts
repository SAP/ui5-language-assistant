import { isEmpty } from "lodash";
import { DocumentCstNode, parse } from "@xml-tools/parser";
import { buildAst } from "@xml-tools/ast";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import {
  UI5Validators,
  validateXMLView as validateXMLViewImpl,
} from "../src/validate-xml-views";
import { OffsetRange, UI5XMLViewIssue } from "../api";

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

  const xmlTextNoMarkers = opts.xmlText.replace(/[🢀🢂]/gu, "");
  const { cst, tokenVector } = parse(xmlTextNoMarkers);
  const ast = buildAst(cst as DocumentCstNode, tokenVector);

  const issues = validateXMLViewImpl({
    validators: { element: [], attribute: [], ...opts.validators },
    xmlView: ast,
    model: opts.model,
  });
  opts.assertion(issues);
}

export function computeExpectedRanges(markedXMLSnippet: string): OffsetRange[] {
  const expectedRanges = [];

  function previousMarkersOffset(): number {
    // "🢂".length === 2 (due to surrogate pairs in UTF-8)
    // Two markers per previous range.
    return expectedRanges.length * 2 * 2;
  }

  const markedPattern = /🢂(.+?)🢀/gu;
  let match;
  // eslint-disable-next-line no-cond-assign
  while ((match = markedPattern.exec(markedXMLSnippet)) !== null) {
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
