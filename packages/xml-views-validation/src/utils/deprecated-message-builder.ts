import { assertNever } from "assert-never";
import {
  UI5DeprecatedInfo,
  UI5SemanticModel,
  UI5Class,
  UI5Aggregation,
  UI5Prop,
  UI5Event,
  UI5Association,
} from "@ui5-language-assistant/semantic-model-types";
import {
  getDeprecationPlainTextSnippet,
  ui5NodeToFQN,
} from "@ui5-language-assistant/logic-utils";

// TODO: add more types here as needed (e.g property/aggregation/...)
export type DeprecatedUI5Symbol = {
  deprecatedInfo: UI5DeprecatedInfo;
} & (UI5Class | UI5Aggregation | UI5Prop | UI5Event | UI5Association);
export function buildDeprecatedIssueMessage({
  symbol,
  model,
}: {
  symbol: DeprecatedUI5Symbol;
  model: UI5SemanticModel;
}): string {
  let kind: string;
  let name: string;
  const symbolKind = symbol.kind;
  switch (symbolKind) {
    case "UI5Class":
      kind = "class";
      name = ui5NodeToFQN(symbol);
      break;
    case "UI5Aggregation":
      kind = "aggregation";
      name = symbol.name;
      break;
    case "UI5Prop":
      kind = "property";
      name = symbol.name;
      break;
    case "UI5Event":
      kind = "event";
      name = symbol.name;
      break;
    case "UI5Association":
      kind = "association";
      name = symbol.name;
      break;
    /* istanbul ignore next - defensive programming */
    default:
      assertNever(symbolKind);
  }
  const msgPrefix = `The ${name} ${kind} is deprecated`;
  return getDeprecationPlainTextSnippet({
    title: msgPrefix,
    deprecatedInfo: symbol.deprecatedInfo,
    model,
  });
}
