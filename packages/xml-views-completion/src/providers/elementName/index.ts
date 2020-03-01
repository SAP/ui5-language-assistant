import { aggregationSuggestions } from "./aggregation";
import { defaultAggregationSuggestions } from "./defaultAggregation";
import { nestedClassSuggestions } from "./nested-class";
import {
  ElementNameCompletion,
  ElementNameCompletionOptions
} from "@xml-tools/content-assist";
import { XMLViewCompletion } from "../../../api";
import { UI5SemanticModel } from "@vscode-ui5/semantic-model-types";

export const elementNameProviders: ElementNameCompletion<
  XMLViewCompletion,
  UI5SemanticModel
>[] = [
  aggregationSuggestions,
  defaultAggregationSuggestions,
  nestedClassSuggestions
];

export type UI5ElementNameCompletionOptions = ElementNameCompletionOptions<
  UI5SemanticModel
>;
