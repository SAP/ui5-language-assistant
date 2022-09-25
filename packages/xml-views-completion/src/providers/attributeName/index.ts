import { AppContext } from "@ui5-language-assistant/semantic-model-types";
import {
  AttributeNameCompletion,
  AttributeNameCompletionOptions,
} from "@xml-tools/content-assist";
import { UI5XMLViewCompletion } from "../../../api";
import { propEventAssocSuggestions } from "./prop-event-assoc";
import { namespaceKeysSuggestions } from "./namespace";

export const attributeNameProviders: AttributeNameCompletion<
  UI5XMLViewCompletion,
  AppContext
>[] = [propEventAssocSuggestions, namespaceKeysSuggestions];

export type UI5AttributeNameCompletionOptions = AttributeNameCompletionOptions<AppContext>;
