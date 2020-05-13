import { filter, includes, reject } from "lodash";

interface WithName {
  name: string;
}

export function filterMembersByPrefix<T extends WithName>(
  members: T[],
  prefix: string
): T[] {
  return filter(members, (_) =>
    // This filtering is case sensitive, which should fit UI5 XML Views
    // Semantics as the first letter's case designates Class(upper) vs Members (aggregations, properties, events) (lower)
    _.name.includes(prefix)
  );
}

export function filterMembersByNames<T extends WithName>(
  members: T[],
  preExistingNames: string[]
): T[] {
  return reject(members, (_) => includes(preExistingNames, _.name));
}

export function filterMembersForSuggestion<T extends WithName>(
  members: T[],
  prefix: string,
  preExistingNames: string[]
): T[] {
  const filteredMembersByPrefix = filterMembersByPrefix(members, prefix);
  return filterMembersByNames(filteredMembersByPrefix, preExistingNames);
}
