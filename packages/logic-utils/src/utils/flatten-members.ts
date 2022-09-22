import { partial } from "lodash";
import { UI5Class } from "@ui5-language-assistant/semantic-model-types";

function flattenMembers<T extends { name: string }>(
  membersGetter: (ui5Class: UI5Class) => T[],
  ui5Class: UI5Class
): T[] {
  const directMembers = membersGetter(ui5Class);
  const ui5SuperClass = ui5Class.extends;
  if (ui5SuperClass !== undefined) {
    // UI5 SDK refers to inherited members (properties, events, aggregations. ...) as "borrowed" ...
    const borrowedMembers = flattenMembers(membersGetter, ui5SuperClass);
    return directMembers.concat(
      borrowedMembers.filter(
        (borrowed) =>
          directMembers.find((direct) => direct.name === borrowed.name) ===
          undefined
      )
    );
  }
  return directMembers;
}

export const flattenProperties = partial(flattenMembers, (_) => _.properties);

export const flattenAggregations = partial(
  flattenMembers,
  (_) => _.aggregations
);

export const flattenEvents = partial(flattenMembers, (_) => _.events);

export const flattenAssociations = partial(
  flattenMembers,
  (_) => _.associations
);
