import {
  getLogger as logger,
  ILogger,
} from "@ui5-language-assistant/logic-utils";

const getPackageName = (): string => {
  let meta: { name: string };
  try {
    meta = require("../../package.json");
  } catch (e) {
    meta = require("../../../package.json");
  }

  if (!meta) {
    return "";
  }
  // eslint-disable-next-line @typescript-eslint/no-var-requires -- Using `require` for .json file as this gets bundled with webpack correctly.
  return meta.name;
};

export const getLogger = (): ILogger => {
  const name = getPackageName();
  return logger(name);
};
