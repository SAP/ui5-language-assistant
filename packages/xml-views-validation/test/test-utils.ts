import { isEmpty } from "lodash";
import { expect } from "chai";
import { DocumentCstNode, parse } from "@xml-tools/parser";
import { buildAst } from "@xml-tools/ast";
import { AppContext } from "@ui5-language-assistant/semantic-model-types";
import { OffsetRange } from "@ui5-language-assistant/logic-utils";
import { UI5ValidatorsConfig } from "../src/validate-xml-views";
import { UI5XMLViewIssue } from "../api";
import { validateXMLView } from "../src/api";
import {
  Config,
  ProjectName,
  ProjectType,
  TestUtils,
} from "@ui5-language-assistant/test-utils";

const START_RANGE_MARKER = "🢂";
const END_RANGE_MARKER = "🢀";

export function testValidationsScenario(opts: {
  xmlText: string;
  context: AppContext;
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
    context: opts.context,
  });
  opts.assertion(issues);
}

export function computeExpectedRanges(markedXMLSnippet: string): OffsetRange[] {
  const expectedRanges: OffsetRange[] = [];

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
  context: AppContext,
  validators: Partial<UI5ValidatorsConfig>,
  xmlSnippet: string
): void {
  testValidationsScenario({
    context: context,
    xmlText: xmlSnippet,
    validators: validators,
    assertion: (issues) => {
      expect(issues).to.be.empty;
    },
  });
}

export function assertSingleIssue(
  context: AppContext,
  validators: Partial<UI5ValidatorsConfig>,
  kind: string,
  severity: string,
  xmlSnippet: string,
  message: string
): void {
  testValidationsScenario({
    context,
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

export async function assertSingleAnnotationIssue(
  testUtils: TestUtils,
  validators: Partial<UI5ValidatorsConfig>,
  severity: string,
  segments: string[],
  xmlSnippet: string,
  kind: string,
  message: string
): Promise<void> {
  await testAnnotationPathValidationsScenario({
    testUtils,
    segments,
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

export async function assertNoAnnotationIssues(
  testUtils: TestUtils,
  validators: Partial<UI5ValidatorsConfig>,
  segments: string[],
  xmlSnippet: string
): Promise<void> {
  await testAnnotationPathValidationsScenario({
    testUtils,
    segments,
    xmlText: xmlSnippet,
    validators: validators,
    assertion: (issues) => {
      expect(issues).to.deep.equal([]);
    },
  });
}

export async function testAnnotationPathValidationsScenario(opts: {
  xmlText: string;
  segments: string[];
  testUtils: TestUtils;
  validators: Partial<UI5ValidatorsConfig>;
  assertion: (issues: UI5XMLViewIssue[]) => void;
}): Promise<void> {
  if (
    isEmpty(opts.validators.attribute) &&
    isEmpty(opts.validators.element) &&
    isEmpty(opts.validators.document)
  ) {
    throw new Error(
      "No validators provided, no relevant scenario can be tested in this manner!"
    );
  }

  const { segments, testUtils } = opts;
  const modelCachePath = opts.testUtils.getModelCachePath();
  const rangeMarkersRegExp = new RegExp(
    `[${START_RANGE_MARKER}${END_RANGE_MARKER}]`,
    "gu"
  );
  const content = opts.xmlText.replace(rangeMarkersRegExp, "");

  await opts.testUtils.updateFile(opts.segments, content);
  const { ast } = await testUtils.readFile(segments);
  const fileUri = testUtils.getFileUri(segments);
  const context = await testUtils.getContextForFile(fileUri, modelCachePath);

  const issues = validateXMLView({
    validators: {
      document: [],
      element: [],
      attribute: [],
      ...opts.validators,
    },
    xmlView: ast,
    context,
  });
  opts.assertion(issues);
}
