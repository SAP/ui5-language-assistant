import { UI5SemanticModel } from "@ui5-editor-tools/semantic-model-types";
import {
  AttributeNameCompletion,
  AttributeNameCompletionOptions
} from "@xml-tools/content-assist";
import { UI5XMLViewCompletion } from "../../../api";
import { propEventAssocSuggestions } from "./prop-event-assoc";
import { namespaceKeysSuggestions } from "./namespace";

export const attributeNameProviders: AttributeNameCompletion<
  UI5XMLViewCompletion,
  UI5SemanticModel
>[] = [propEventAssocSuggestions, namespaceKeysSuggestions];

export type UI5AttributeNameCompletionOptions = AttributeNameCompletionOptions<
  UI5SemanticModel
>;
