import { map } from "lodash";
import {
  validations,
  buildMessage,
} from "@ui5-language-assistant/user-facing-text";
import { NonUniqueIDIssue } from "../../api";
import { Context } from "@ui5-language-assistant/context";
import { URI } from "vscode-uri";

const { NON_UNIQUE_ID } = validations;

export function validateNonUniqueID(context: Context): NonUniqueIDIssue[] {
  const allIDsIssues: NonUniqueIDIssue[] = [];
  const uri = URI.file(context.documentPath).toString();
  for (const [key, value] of context.controlIds) {
    if (value.length > 1) {
      const currentDocIssues = value.filter((i) => i.uri === uri);
      const otherDocsIssues = value.filter((i) => i.uri !== uri);
      for (const currentDocIssue of currentDocIssues) {
        allIDsIssues.push({
          issueType: "base",
          kind: "NonUniqueIDIssue",
          message: buildMessage(NON_UNIQUE_ID.msg, key),
          severity: "error",
          offsetRange: currentDocIssue.offsetRange,
          identicalIDsRanges: map(otherDocsIssues, (_) => ({
            range: _.range,
            uri: _.uri,
          })),
        });
      }
    }
  }
  return allIDsIssues;
}
