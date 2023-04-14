import {
  AttributeNameCompletion,
  AttributeNameCompletionOptions,
} from "@xml-tools/content-assist";
import { UI5XMLViewCompletion } from "../../../api";
import { propEventAssocSuggestions } from "./prop-event-assoc";
import { namespaceKeysSuggestions } from "./namespace";
import { Context } from "@ui5-language-assistant/context";

export const attributeNameProviders: AttributeNameCompletion<
  UI5XMLViewCompletion,
  Context
>[] = [propEventAssocSuggestions, namespaceKeysSuggestions];

export type UI5AttributeNameCompletionOptions =
  AttributeNameCompletionOptions<Context>;
