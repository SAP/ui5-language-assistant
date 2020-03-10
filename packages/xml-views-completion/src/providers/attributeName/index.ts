import { UI5SemanticModel } from "@vscode-ui5/semantic-model-types";
import {
  AttributeNameCompletion,
  AttributeNameCompletionOptions
} from "@xml-tools/content-assist";
import { XMLViewCompletion } from "../../../api";
import { propertyAndEventSuggestions } from "./property-and-event";
import { namespaceKeysSuggestions } from "./namespace";

export const attributeNameProviders: AttributeNameCompletion<
  XMLViewCompletion,
  UI5SemanticModel
>[] = [propertyAndEventSuggestions, namespaceKeysSuggestions];

export type UI5AttributeNameCompletionOptions = AttributeNameCompletionOptions<
  UI5SemanticModel
>;
