import { Context } from "@ui5-language-assistant/context";
import {
  AttributeValueCompletion,
  AttributeValueCompletionOptions,
} from "@xml-tools/content-assist";
import { UI5XMLViewAnnotationCompletion } from "../../../types";
import { filterBarAttributeSuggestions } from "./filter-bar";
import { metaPathSuggestions } from "./meta-path";

export const attributeValueProviders: AttributeValueCompletion<
  UI5XMLViewAnnotationCompletion,
  Context
>[] = [metaPathSuggestions, filterBarAttributeSuggestions];

export type UI5AttributeValueCompletionOptions =
  AttributeValueCompletionOptions<Context>;
