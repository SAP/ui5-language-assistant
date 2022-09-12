import { resolve } from "path";
import { existsSync } from "fs";
import { getNodeDetail, getUI5NodeName } from "./documentation";

// for use in productive flows
const bundledPath = resolve(__dirname, "..", "..", "dist", "server.js");

const sourcesPath = resolve(__dirname, "server.js");

// We assume that if the `node_modules` directory exists then we are running
// in development mode, We rely on the fact that the bundled .vsix file of the
// VSCode extension excludes the this package's `node_modules` folder (among others).
// Note this logic would not work with yarn 2.0 / npm 8 / pnpm as `node_modules`
// is no longer created by those package managers.
const isDevelopmentRun = existsSync(
  resolve(__dirname, "..", "..", "node_modules")
);

export const SERVER_PATH: string = isDevelopmentRun
  ? /* istanbul ignore else - no tests (yet?) on bundled artifacts */
    sourcesPath
  : bundledPath;

export async function getNodeName(
  text: string,
  offsetAt: number,
  cachePath?: string | undefined,
  framework?: string | undefined,
  ui5Version?: string | undefined
): Promise<string | undefined> {
  const ui5Node = await getUI5NodeName(
    offsetAt,
    text,
    undefined,
    cachePath,
    framework,
    ui5Version
  );
  return ui5Node
    ? ui5Node.kind !== "UI5Class"
      ? `${ui5Node.parent?.library}.${ui5Node.parent?.name}`
      : getNodeDetail(ui5Node)
    : undefined;
}
