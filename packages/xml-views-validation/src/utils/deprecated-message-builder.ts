import { UI5DeprecatedInfo } from "@ui5-language-assistant/semantic-model-types";

// TODO: unit tests for all edge cases
export function buildDeprecatedIssueMessage({
  ui5Kind,
  fqn,
  deprecatedInfo,
}: {
  // TODO: add more kinds here as needed (e.g property/aggregation/...)
  ui5Kind: "Class";
  fqn: string;
  deprecatedInfo: UI5DeprecatedInfo;
}): string {
  const msgPrefix = `UI5 ${ui5Kind} ${fqn} is deprecated`;
  const sinceOptionalPart = deprecatedInfo.since
    ? ` since version: ${deprecatedInfo.since}`
    : "";

  // we are ignoring the deprecated description because there is no way to render
  // a link or complex messages nicely in the problems views (unlike in completions use case).
  return `${msgPrefix}${sinceOptionalPart}.`;
}
