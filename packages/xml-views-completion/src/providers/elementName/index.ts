import { aggregationSuggestions } from "./aggregation";
import { classesSuggestions } from "./classes";
import {
  ElementNameCompletion,
  ElementNameCompletionOptions,
} from "@xml-tools/content-assist";
import { UI5XMLViewCompletion } from "../../../api";
import { AppContext } from "@ui5-language-assistant/semantic-model-types";

export const elementNameProviders: ElementNameCompletion<
  UI5XMLViewCompletion,
  AppContext
>[] = [aggregationSuggestions, classesSuggestions];

export type UI5ElementNameCompletionOptions = ElementNameCompletionOptions<AppContext>;
