import { isPlainObject } from "lodash";
import { UI5SemanticModel } from "@vscode-ui5/semantic-model-types";
import { forEachSymbol } from "@vscode-ui5/semantic-model";

export function isObject(value: unknown): value is Record<string, unknown> {
  return isPlainObject(value);
}
export function getFQN(
  model: UI5SemanticModel,
  target: unknown
): string | undefined {
  let fqn: string | undefined = undefined;
  forEachSymbol(model, (symbol, name) => {
    if (symbol === target) {
      fqn = name;
      return false;
    }
    return undefined;
  });
  return fqn;
}
