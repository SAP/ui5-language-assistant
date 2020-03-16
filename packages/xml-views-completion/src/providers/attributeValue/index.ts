import { UI5SemanticModel } from "@ui5-editor-tools/semantic-model-types";
import {
  AttributeValueCompletion,
  AttributeValueCompletionOptions
} from "@xml-tools/content-assist";
import { XMLViewCompletion } from "../../../api";
import { enumSuggestions } from "../attributeValue/enum";

export const attributeValueProviders: AttributeValueCompletion<
  XMLViewCompletion,
  UI5SemanticModel
>[] = [enumSuggestions];

export type UI5AttributeValueCompletionOptions = AttributeValueCompletionOptions<
  UI5SemanticModel
>;
