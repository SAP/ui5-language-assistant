import { cloneDeep } from "lodash";
import omitDeep from "omit-deep-lodash";

// TODO: This interface should be provided by the logging library.
// Initially we are only providing a fairly simple API, additional variants can be added as needed...
export interface ILogger {
  /* eslint-disable @typescript-eslint/no-explicit-any -- meta is an object with string type key and any type value */
  fatal: (msg: string, meta?: Record<string, any>) => void;
  error: (msg: string, meta?: Record<string, any>) => void;
  warn: (msg: string, meta?: Record<string, any>) => void;
  info: (msg: string, meta?: Record<string, any>) => void;
  debug: (msg: string, meta?: Record<string, any>) => void;
  trace: (msg: string, meta?: Record<string, any>) => void;
  /* eslint-enable @typescript-eslint/no-explicit-any -- meta is an object with string type key and any type value */
}

const NOOP_LOGGER: ILogger = {
  /* eslint-disable @typescript-eslint/no-empty-function -- NOOP */
  fatal: () => {},
  error: () => {},
  warn: () => {},
  info: () => {},
  debug: () => {},
  trace: () => {},
  /* eslint-enable @typescript-eslint/no-empty-function -- NOOP */
};

let logger = NOOP_LOGGER;
export function getLogger(): ILogger {
  return logger;
}

export function initBasFileLogger(): void {
  const possibleSensitiveProps = ["uri"];
  // TODO: use this to transform the meta argument to the log methods and remove possible personal information
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function removePossibleUserInformation(obj: Record<string, unknown>) {
    const clonedObj = cloneDeep(obj);
    return omitDeep(clonedObj, possibleSensitiveProps);
  }
  // TODO: init FILE Based BAS Logger
  logger = NOOP_LOGGER;
}
