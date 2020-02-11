import { XMLViewCompletion } from "../../../api";
import { UI5ElementNameCompletionOptions } from "../../types";

export function defaultAggregationSuggestions(
  opts: UI5ElementNameCompletionOptions
): XMLViewCompletion[] {
  console.log(opts);
  return [];
}
