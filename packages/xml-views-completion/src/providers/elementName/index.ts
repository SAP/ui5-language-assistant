import { aggregationSuggestions } from "./aggregation";
import { classesSuggestions } from "./classes";
import {
  ElementNameCompletion,
  ElementNameCompletionOptions
} from "@xml-tools/content-assist";
import { UI5XMLViewCompletion } from "../../../api";
import { UI5SemanticModel } from "@ui5-editor-tools/semantic-model-types";

export const elementNameProviders: ElementNameCompletion<
  UI5XMLViewCompletion,
  UI5SemanticModel
>[] = [aggregationSuggestions, classesSuggestions];

export type UI5ElementNameCompletionOptions = ElementNameCompletionOptions<
  UI5SemanticModel
>;
