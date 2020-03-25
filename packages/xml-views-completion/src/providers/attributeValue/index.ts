import { UI5SemanticModel } from "@ui5-editor-tools/semantic-model-types";
import {
  AttributeValueCompletion,
  AttributeValueCompletionOptions
} from "@xml-tools/content-assist";
import { UI5XMLViewCompletion } from "../../../api";
import { enumSuggestions } from "../attributeValue/enum";
import { namespaceValueSuggestions } from "../attributeValue/namespace";

export const attributeValueProviders: AttributeValueCompletion<
  UI5XMLViewCompletion,
  UI5SemanticModel
>[] = [enumSuggestions, namespaceValueSuggestions];

export type UI5AttributeValueCompletionOptions = AttributeValueCompletionOptions<
  UI5SemanticModel
>;
