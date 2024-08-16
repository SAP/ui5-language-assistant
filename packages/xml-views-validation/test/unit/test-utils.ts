import { isEmpty } from "lodash";
import { DocumentCstNode, parse } from "@xml-tools/parser";
import { buildAst } from "@xml-tools/ast";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { OffsetRange } from "@ui5-language-assistant/logic-utils";
import { UI5ValidatorsConfig } from "../../src/validate-xml-views";
import { UI5XMLViewIssue } from "../../api";
import { validateXMLView } from "../../src/api";
import { Context } from "@ui5-language-assistant/context";
import { DEFAULT_UI5_FRAMEWORK } from "@ui5-language-assistant/constant";

const START_RANGE_MARKER = "🢂";
const END_RANGE_MARKER = "🢀";

export function testValidationsScenario(opts: {
  xmlText: string;
  context: Context;
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
  opts.context.viewFiles[opts.context.documentPath] = ast;

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
  context: Context,
  validators: Partial<UI5ValidatorsConfig>,
  xmlSnippet: string
): void {
  testValidationsScenario({
    context,
    xmlText: xmlSnippet,
    validators: validators,
    assertion: (issues) => {
      expect(issues).toBeEmpty();
    },
  });
}

export function assertSingleIssue(
  context: Context,
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
      expect(issues).toStrictEqual([
        {
          issueType: "base",
          kind: kind,
          message: message,
          offsetRange: computeExpectedRange(xmlSnippet),
          severity: severity,
        },
      ]);
    },
  });
}

export const getDefaultContext = (ui5Model: UI5SemanticModel): Context => {
  return {
    ui5Model,
    customViewId: "",
    manifestDetails: {
      appId: "",
      manifestPath: "",
      flexEnabled: false,
      customViews: {},
      mainServicePath: undefined,
      minUI5Version: undefined,
    },
    services: {},
    yamlDetails: {
      framework: DEFAULT_UI5_FRAMEWORK,
      version: undefined,
    },
    viewFiles: {},
    controlIds: new Map(),
    documentPath: "",
  };
};
