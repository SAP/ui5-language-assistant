import { AppContext } from "@ui5-language-assistant/semantic-model-types";
import {
  AttributeValueCompletion,
  AttributeValueCompletionOptions,
} from "@xml-tools/content-assist";
import { UI5XMLViewCompletion } from "../../../api";
import { enumSuggestions } from "./enum";
import { namespaceValueSuggestions } from "./namespace";
import { booleanSuggestions } from "./boolean-literal";
import { filterBarAttributeSuggestions } from "./filter-bar";
import { metaPathSuggestions } from "./meta-path";
import { contextPathSuggestions } from "./context-path";

export const attributeValueProviders: AttributeValueCompletion<
  UI5XMLViewCompletion,
  AppContext
>[] = [
  enumSuggestions,
  namespaceValueSuggestions,
  booleanSuggestions,
  filterBarAttributeSuggestions,
  metaPathSuggestions,
  contextPathSuggestions,
];

export type UI5AttributeValueCompletionOptions = AttributeValueCompletionOptions<AppContext>;
