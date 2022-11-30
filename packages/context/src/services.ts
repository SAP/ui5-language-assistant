import { CAP_PROJECT_TYPE, ServiceDetails, UI5_PROJECT_TYPE } from "./types";
import { getProject } from "./loader";

/**
 * Get services of a UI5 or CAP project
 *
 * @param documentPath path to a file e.g. absolute/path/webapp/ext/main/Main.view.xml
 */
export async function getServices(
  documentPath: string
): Promise<Record<string, ServiceDetails>> {
  const project = await getProject(documentPath);
  const services = {};
  if (!project) {
    return services;
  }
  if (project.type === CAP_PROJECT_TYPE) {
    for (const [, app] of project.apps) {
      for (const [servicePath, service] of app.localServices) {
        services[servicePath] = {
          path: service.path,
          convertedMetadata: service.convertedMetadata,
        };
      }
    }
    return services;
  }
  if (project.type === UI5_PROJECT_TYPE) {
    for (const [servicePath, service] of project.app.localServices) {
      services[servicePath] = {
        path: service.path,
        convertedMetadata: service.convertedMetadata,
      };
    }
    return services;
  }
  return {};
}
