import { map } from "lodash";
import {
  validations,
  buildMessage,
} from "@ui5-language-assistant/user-facing-text";
import { NonUniqueIDIssue } from "../../api";
import {
  Context,
  type ControlIdLocation,
} from "@ui5-language-assistant/context";
import { URI } from "vscode-uri";
import { getConfigurationSettings } from "@ui5-language-assistant/settings";
import { Range } from "vscode-languageserver-types";

const { NON_UNIQUE_ID } = validations;

/**
 * Determine if there is a non-unique ID issue.
 * @param {ControlIdLocation[]} ctrId - An array of ControlIdLocation objects representing the control IDs.
 * @param {ControlIdLocation[]} currentDocIssues - An array of ControlIdLocation objects representing the current document's issues.
 * @returns {boolean} - Returns true if there is a non-unique ID issue, otherwise false.
 */
const isNoneUniqueIdIssue = (
  ctrId: ControlIdLocation[],
  currentDocIssues: ControlIdLocation[]
): boolean => {
  const settings = getConfigurationSettings();
  const reportNonUniqueIds = settings.ReportNonUniqueIdsCrossViewFiles;
  if (reportNonUniqueIds) {
    return ctrId.length > 1;
  }
  return ctrId.length > 1 && currentDocIssues.length > 1;
};

const getIdenticalIDsRanges = (
  otherDocsIssues: ControlIdLocation[]
): {
  range: Range;
  uri: string;
}[] => {
  const settings = getConfigurationSettings();
  const reportNonUniqueIds = settings.ReportNonUniqueIdsCrossViewFiles;
  if (reportNonUniqueIds) {
    return map(otherDocsIssues, (_) => ({
      range: _.range,
      uri: _.uri,
    }));
  }
  return [];
};
/**
 * Validates non-unique control IDs within the specified context
 * @param {Context} context - The context containing the control IDs to be validated
 * @returns {NonUniqueIDIssue[]} - Array of non-unique control ID issues
 */
export function validateNonUniqueID(context: Context): NonUniqueIDIssue[] {
  const allIDsIssues: NonUniqueIDIssue[] = [];
  const uri = URI.file(context.documentPath).toString();

  for (const [key, value] of context.controlIds) {
    const currentDocIssues = value.filter((i) => i.uri === uri);
    if (isNoneUniqueIdIssue(value, currentDocIssues)) {
      const otherDocsIssues = value.filter((i) => i.uri !== uri);
      for (const currentDocIssue of currentDocIssues) {
        allIDsIssues.push({
          issueType: "base",
          kind: "NonUniqueIDIssue",
          message: buildMessage(NON_UNIQUE_ID.msg, key),
          severity: "error",
          offsetRange: currentDocIssue.offsetRange,
          identicalIDsRanges: getIdenticalIDsRanges(otherDocsIssues),
        });
      }
    }
  }
  return allIDsIssues;
}
