import type { Manifest } from "@sap-ux/project-access";
import { getManifestDetails, getUI5Manifest } from "../src/api";
import { join } from "path";
import { ManifestDetails, ProjectKind, ProjectType } from "../src/types";

interface ProjectData {
  appRoot: string;
  manifest: Manifest;
  manifestDetails: ManifestDetails;
  projectInfo: { type: ProjectType; kind: ProjectKind };
}

export const getProjectData = async (
  projectRoot: string
): Promise<ProjectData> => {
  const appRoot = join(projectRoot, "app", "manage_travels", "webapp");
  const manifestRoot = join(appRoot, "manifest.json");
  const manifest = (await getUI5Manifest(manifestRoot)) as Manifest;
  const documentPath = join(
    projectRoot,
    "app",
    "manage_travels",
    "webapp",
    "ext",
    "main",
    "Main.view.xml"
  );
  const manifestDetails = await getManifestDetails(documentPath);
  const projectInfo: { type: ProjectType; kind: ProjectKind } = {
    type: "CAP",
    kind: "NodeJS",
  };
  return { projectInfo, manifest, manifestDetails, appRoot };
};
