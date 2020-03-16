import { UI5SemanticModel } from "@ui5-editor-tools/semantic-model-types/api";
import {
  AttributeNameCompletion,
  AttributeNameCompletionOptions
} from "@xml-tools/content-assist";
import { XMLViewCompletion } from "../../../api";
import { propEventAssocSuggestions } from "./prop-event-assoc";
import { namespaceKeysSuggestions } from "./namespace";

export const attributeNameProviders: AttributeNameCompletion<
  XMLViewCompletion,
  UI5SemanticModel
>[] = [propEventAssocSuggestions, namespaceKeysSuggestions];

export type UI5AttributeNameCompletionOptions = AttributeNameCompletionOptions<
  UI5SemanticModel
>;
