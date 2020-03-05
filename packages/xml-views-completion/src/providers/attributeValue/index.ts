import { UI5SemanticModel } from "@vscode-ui5/semantic-model-types";
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
