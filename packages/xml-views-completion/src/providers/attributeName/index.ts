import { propertyAndEventSuggestions } from "./property-and-event";
import {
  AttributeNameCompletion,
  AttributeNameCompletionOptions
} from "@xml-tools/content-assist";
import { XMLViewCompletion } from "../../../api";
import { UI5SemanticModel } from "@vscode-ui5/semantic-model-types";

export const attributeNameProviders: AttributeNameCompletion<
  XMLViewCompletion,
  UI5SemanticModel
>[] = [propertyAndEventSuggestions];

export type UI5AttributeNameCompletionOptions = AttributeNameCompletionOptions<
  UI5SemanticModel
>;
