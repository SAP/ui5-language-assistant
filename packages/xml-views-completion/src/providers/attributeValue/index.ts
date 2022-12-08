import { Context } from "@ui5-language-assistant/context";
import {
  AttributeValueCompletion,
  AttributeValueCompletionOptions,
} from "@xml-tools/content-assist";
import { UI5XMLViewCompletion } from "../../../api";
import { enumSuggestions } from "./enum";
import { namespaceValueSuggestions } from "./namespace";
import { booleanSuggestions } from "./boolean-literal";

export const attributeValueProviders: AttributeValueCompletion<
  UI5XMLViewCompletion,
  Context
>[] = [enumSuggestions, namespaceValueSuggestions, booleanSuggestions];

export type UI5AttributeValueCompletionOptions = AttributeValueCompletionOptions<Context>;
