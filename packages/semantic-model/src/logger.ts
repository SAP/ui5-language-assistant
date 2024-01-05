import { getLogger as logger, ILogger } from "@ui5-language-assistant/logger";
import { PACKAGE_NAME } from "./constant";

export const getLogger = (): ILogger => {
  return logger(PACKAGE_NAME);
};
