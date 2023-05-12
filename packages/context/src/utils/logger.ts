import {
  getLogger as logger,
  ILogger,
} from "@ui5-language-assistant/logic-utils";
import { findFileUp } from "./fileUtils";

const getPackageName = (): string => {
  const path = findFileUp("package.json", "../../..");
  if (!path) {
    return "";
  }
  // eslint-disable-next-line @typescript-eslint/no-var-requires -- Using `require` for .json file as this gets bundled with webpack correctly.
  const meta = require(path);
  return meta.name;
};

export const getLogger = (): ILogger => {
  const name = getPackageName();
  return logger(name);
};
