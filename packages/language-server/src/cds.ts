import { join } from "path";
import { getLogger } from "./logger";

const metadataCache: { [path: string]: string } = {};

// TODO: multiples services

export async function getCdsMetadata(
  appRoot: string
): Promise<string | undefined> {
  try {
    const cdsRoot = require.resolve("@sap/cds", { paths: [appRoot] });
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const cds = require(cdsRoot);
    const root = cdsRoot.split("/node_modules")[0];
    let csn: any;
    try {
      csn = await cds.load([
        join(root, "app"),
        join(root, "db"),
        join(root, "srv"),
      ]); // TODO: more robust project loading
    } catch (e: any) {
      if (e?.model) {
        csn = e.model;
      } else {
        throw e;
      }
    }
    return cds.compile.to.edmx(csn, {
      version: "v4",
      odataForeignKeys: true,
      odataContainment: false,
    });
  } catch (error) {
    if (typeof error === "string") {
      getLogger().trace(error);
    } else if (typeof error?.toString === "function") {
      getLogger().trace(error.toString());
    }
  }
  return undefined;
}
