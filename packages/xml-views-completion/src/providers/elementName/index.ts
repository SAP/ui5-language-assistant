import { aggregationSuggestions } from "./aggregation";
import { classesSuggestions } from "./classes";
import {
  ElementNameCompletion,
  ElementNameCompletionOptions,
} from "@xml-tools/content-assist";
import { UI5XMLViewCompletion } from "../../../api";
import { Context } from "@ui5-language-assistant/context";

export const elementNameProviders: ElementNameCompletion<
  UI5XMLViewCompletion,
  Context
>[] = [aggregationSuggestions, classesSuggestions];

export type UI5ElementNameCompletionOptions =
  ElementNameCompletionOptions<Context>;
