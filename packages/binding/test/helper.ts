import { BindingIssue } from "../api";

// todo - range instead of offset
export const issueToSnapshot = (item: BindingIssue): string =>
  `kind: ${item.kind}; text: ${item.message}; severity:${item.severity}; range:${item.range.start.line}:${item.range.start.character}-${item.range.end.line}:${item.range.end.character}`;
