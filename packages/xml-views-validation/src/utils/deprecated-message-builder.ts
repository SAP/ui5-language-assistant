import { assertNever } from "assert-never";
import {
  UI5DeprecatedInfo,
  UI5SemanticModel,
  UI5Class,
} from "@ui5-language-assistant/semantic-model-types";
import {
  getDeprecationPlainTextSnippet,
  ui5NodeToFQN,
} from "@ui5-language-assistant/logic-utils";

// TODO: add more types here as needed (e.g property/aggregation/...)
export type DeprecatedUI5Symbol = {
  deprecatedInfo: UI5DeprecatedInfo;
} & UI5Class;
export function buildDeprecatedIssueMessage({
  symbol,
  model,
}: {
  symbol: DeprecatedUI5Symbol;
  model: UI5SemanticModel;
}): string {
  let kind: string;
  let name: string;
  switch (symbol.kind) {
    case "UI5Class":
      kind = "class";
      name = ui5NodeToFQN(symbol);
      break;
    /* istanbul ignore next - defensive programming */
    default:
      assertNever(symbol.kind);
  }
  const msgPrefix = `The ${name} ${kind} is deprecated`;
  return getDeprecationPlainTextSnippet(
    msgPrefix,
    symbol.deprecatedInfo,
    model
  );
}
