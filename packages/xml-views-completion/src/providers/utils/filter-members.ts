import { filter, includes, reject } from "lodash";
import { xmlToFQN } from "@vscode-ui5/logic-utils";
import { XMLElement } from "@xml-tools/ast";
import { UI5Class, UI5SemanticModel } from "@vscode-ui5/semantic-model-types";

interface WithName {
  name: string;
}

export function filterMembersByPrefix<T extends WithName>(
  members: T[],
  prefix: string
): T[] {
  return filter(members, _ =>
    // This filtering is case sensitive, which should fit UI5 XML Views
    // Semantics as the first letter's case designates Class(upper) vs Members (aggregations, properties, events) (lower)
    _.name.includes(prefix)
  );
}

export function filterMembersByNames<T extends WithName>(
  members: T[],
  preExistingNames: string[]
): T[] {
  return reject(members, _ => includes(preExistingNames, _.name));
}

export function filterMembersForSuggestion<T extends WithName>(
  members: T[],
  prefix: string,
  preExisingNames: string[]
): T[] {
  const filteredMembersByPrefix = filterMembersByPrefix(members, prefix);
  return filterMembersByNames(filteredMembersByPrefix, preExisingNames);
}

export function getClassByElement(
  element: XMLElement,
  model: UI5SemanticModel
): UI5Class {
  const elementTagFqn = xmlToFQN(element);
  return model.classes[elementTagFqn];
}
