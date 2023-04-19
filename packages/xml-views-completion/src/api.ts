import { filter, includes, reject } from "lodash";
import { assertNever } from "assert-never";
import { getSuggestions } from "@xml-tools/content-assist";
import { UI5Visibility } from "@ui5-language-assistant/semantic-model-types";
import {
  GetXMLViewCompletionsOpts,
  UI5XMLViewCompletion,
  UI5NodeXMLViewCompletion,
} from "../api";
import { elementNameProviders } from "./providers/elementName";
import { attributeNameProviders } from "./providers/attributeName";
import { attributeValueProviders } from "./providers/attributeValue";
import { CodeAssistSettings } from "@ui5-language-assistant/settings";
import { Context } from "@ui5-language-assistant/context";

export function getXMLViewCompletions(
  opts: GetXMLViewCompletionsOpts
): UI5XMLViewCompletion[] {
  const suggestions = getSuggestions<UI5XMLViewCompletion, Context>({
    offset: opts.offset,
    cst: opts.cst,
    ast: opts.ast,
    tokenVector: opts.tokenVector,
    context: opts.context,
    providers: {
      elementContent: [],
      elementName: elementNameProviders,
      attributeName: attributeNameProviders,
      attributeValue: attributeValueProviders,
    },
  });

  const allowedVisibility: UI5Visibility[] = ["public", "protected"];
  const publicAndProtectedSuggestions = filter(
    suggestions,
    (_) =>
      !isUI5NodeXMLViewCompletion(_) ||
      includes(allowedVisibility, _.ui5Node.visibility)
  );

  const filteredSuggestions = filterBySettings(
    publicAndProtectedSuggestions,
    opts.settings
  );

  return filteredSuggestions;
}

function filterBySettings(
  suggestions: UI5XMLViewCompletion[],
  settings: CodeAssistSettings
): UI5XMLViewCompletion[] {
  let filteredSuggestions = suggestions;
  if (!settings.codeAssist.deprecated) {
    filteredSuggestions = reject(
      filteredSuggestions,
      (suggestion) =>
        isUI5NodeXMLViewCompletion(suggestion) &&
        suggestion.ui5Node.deprecatedInfo?.isDeprecated === true
    );
  }
  if (!settings.codeAssist.experimental) {
    filteredSuggestions = reject(
      filteredSuggestions,
      (suggestions) =>
        isUI5NodeXMLViewCompletion(suggestions) &&
        suggestions.ui5Node.experimentalInfo?.isExperimental === true
    );
  }
  return filteredSuggestions;
}

export function isUI5NodeXMLViewCompletion(
  suggestion: UI5XMLViewCompletion
): suggestion is UI5NodeXMLViewCompletion {
  const type = suggestion.type;
  switch (type) {
    case "UI5AggregationsInXMLTagName":
    case "UI5AssociationsInXMLAttributeKey":
    case "UI5ClassesInXMLTagName":
    case "UI5EnumsInXMLAttributeValue":
    case "UI5EventsInXMLAttributeKey":
    case "UI5NamespacesInXMLAttributeKey":
    case "UI5NamespacesInXMLAttributeValue":
    case "UI5PropsInXMLAttributeKey": {
      return true;
    }
    case "BooleanValueInXMLAttributeValue": {
      return false;
    }
    /* istanbul ignore next - defensive programming */
    default: {
      assertNever(type, true);
      return false;
    }
  }
}
