import type { BindingInfoElement } from "../types";
import { aggregationBindingInfoElements } from "./fall-back-aggregation-binding-info";
import { propertyBindingInfoElements } from "./fall-back-property-binding-info";

/**
 * In some of UI5 versions e.g "1.71.49", `api.json` does not contain `typedefs` for `PropertyBindingInfo` or `AggregationBindingInfo`. Therefore provides a fallback
 * to support basic code completion and diagnostics. Once `api.json` is enhanced to include `typedefs` for `PropertyBindingInfo` and `AggregationBindingInfo` for all LTS of UI5 versions, this fallback can be
 * completely deleted
 */
export const getFallBackElements = (
  aggregation = false
): BindingInfoElement[] => {
  if (aggregation) {
    return aggregationBindingInfoElements;
  }

  return propertyBindingInfoElements;
};
