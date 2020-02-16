import { UI5Aggregation, UI5Class } from "@vscode-ui5/semantic-model";

export function flattenAggregations(ui5Class: UI5Class): UI5Aggregation[] {
  const directAggregations = ui5Class.aggregations;
  const ui5SuperClass = ui5Class.extends;
  if (ui5SuperClass !== undefined) {
    // UI5 SDK refers to inherited aggregations as "borrowed" ...
    const borrowedAggregations = flattenAggregations(ui5SuperClass);
    return directAggregations.concat(borrowedAggregations);
  } else {
    return directAggregations;
  }
}
