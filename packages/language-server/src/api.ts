import { resolve } from "path";
import { existsSync } from "fs";

// for use in productive flows
const bundledPath = resolve(
  __dirname,
  "..",
  "node_modules/@ui5-language-assistant/language-server/dist",
  "server.js"
);

const sourcesPath = resolve(__dirname, "server.js");

// We assume that if the `tsconfig.json` file exists then we are running
// in development mode, We rely on the fact that the bundled .vsix file of the
// VSCode extension excludes tsconfig files
const isDevelopmentRun = existsSync(
  resolve(__dirname, "..", "..", "tsconfig.json")
);

export const SERVER_PATH: string = isDevelopmentRun
  ? /* istanbul ignore else - no tests (yet?) on bundled artifacts */
    sourcesPath
  : bundledPath;
