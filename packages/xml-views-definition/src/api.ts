import { Location } from "vscode-languageserver-types";
import { DefinitionParams } from "vscode-languageserver";
import { getControllerLocation } from "./controller";

/**
 * Get definition location(s). This method implements `onDefinition` request of LSP (Language Server Protocol)
 *
 * @param param definition param
 * @returns definition location(s)
 */
export async function getDefinition(
  param: DefinitionParams
): Promise<Location[]> {
  const ctrLoc = await getControllerLocation(param);
  return [...ctrLoc];
}
