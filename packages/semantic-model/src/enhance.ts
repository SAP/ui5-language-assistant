import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { GENERATED_LIBRARY } from "./api";
import { getParentFqn, newMap, forEachSymbol, findSymbol } from "./utils";

export function generateMissingSymbols(
  model: UI5SemanticModel,
  // Keeping this argument (currently unused) for consistency
  strict: boolean // eslint-disable-line @typescript-eslint/no-unused-vars
): void {
  addImplicitNamespacesForModel(model);
}

function addImplicitNamespacesForModel(model: UI5SemanticModel): void {
  forEachSymbol(model, (value, key) => {
    addImplicitParentNamespaces(model, key, value.name);
  });
}

function addImplicitParentNamespaces(
  model: UI5SemanticModel,
  fqn: string,
  name: string
): void {
  const parentFqn = getParentFqn(fqn, name);
  if (parentFqn !== undefined && findSymbol(model, parentFqn) === undefined) {
    // Take the name starting from the last dot (or the entire name if there is no dot)
    const parentName = parentFqn.substring(parentFqn.lastIndexOf(".") + 1);
    model.namespaces[parentFqn] = {
      kind: "UI5Namespace",
      name: parentName,
      fields: [],
      visibility: "public",
      events: [],
      methods: [],
      parent: undefined,
      library: GENERATED_LIBRARY,
      namespaces: newMap(),
      classes: newMap(),
      description: undefined,
      since: undefined,
      deprecatedInfo: undefined,
      experimentalInfo: undefined
    };
    if (parentFqn !== parentName) {
      addImplicitParentNamespaces(model, parentFqn, parentName);
    }
  }
}
