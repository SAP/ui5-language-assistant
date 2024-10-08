import findUp from "find-up";
import { FileName } from "@sap-ux/project-access";
/**
 * Get path of a manifest.appdescr_variant file for adaption project.
 * @param documentPath path to a file e.g. absolute/path/webapp/ext/main/Main.view.xml
 */
export async function finAdpdManifestPath(
  documentPath: string
): Promise<string | undefined> {
  return findUp(FileName.ManifestAppDescrVar, { cwd: documentPath });
}
