import {
  getLogger as logger,
  ILogger,
} from "@ui5-language-assistant/logic-utils";
import { join } from "path";
import { readJsonSync } from "fs-extra";

// const getPackageName = (): string => {
//   // eslint-disable-next-line @typescript-eslint/no-var-requires -- Using `require` for .json file as this gets bundled with webpack correctly.
//   const meta = require("../../package.json");
//   return meta.name;
// };
const getPackageName = (): string => {
  let meta;
  try {
    // in production - ../extensions/saposs.vscode-ui5-language-assistant-4.0.6/dist which equals to vscode-ui5-language-assistant/dist
    meta = readJsonSync(join(__dirname, "..", "package.json"));
  } catch (error) {
    meta = readJsonSync(join(__dirname, "..", "..", "package.json"));
  }
  return meta?.name;
};

const name = getPackageName();
export const getLogger = (): ILogger => {
  return logger(name);
};
