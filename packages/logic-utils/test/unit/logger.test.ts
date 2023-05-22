import { getLogger, getLogLevel, setLogLevel } from "../../src/api";
import { LogLevel } from "@vscode-logging/logger";
import { validLoggingLevelValues } from "@ui5-language-assistant/settings";

describe("the Language Server Logger", () => {
  let errorSpy;
  const extName = "dummyExt";

  beforeAll(() => {
    errorSpy = jest.spyOn(console, "error");
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("supports structured JSON logging", async () => {
    getLogger(extName).error("hello world", { a: 1, b: [1, 2, 3] });
    const logEntry = errorSpy.mock.calls[0];
    const jsonLogEntry = JSON.parse(logEntry);
    expect(jsonLogEntry).toHaveProperty("a", 1);
    expect(jsonLogEntry).toHaveProperty("b", [1, 2, 3]);
  });

  describe("log level", () => {
    let orgLevel: LogLevel;

    beforeEach(() => {
      orgLevel = getLogLevel();
    });

    it("supports changing the log level", async () => {
      setLogLevel(extName, "fatal");
      getLogger(extName).error(
        "`error` is lower than `fatal` so no logging should happen"
      );
      expect(errorSpy).not.toHaveBeenCalled();
      getLogger(extName).fatal("`fatal` should cause logging to the console");
      expect(errorSpy).toHaveBeenCalled();
    });

    it("does not allow changing to an **unknown** logLevel", async () => {
      // "Verbose" is not a valid log level for the language server
      setLogLevel(extName, "Verbose" as "trace");
      const currentLogLevel = getLogLevel();
      expect(currentLogLevel).not.toEqual("Verbose");
      expect(validLoggingLevelValues[currentLogLevel]).toBeTrue();
    });

    afterEach(() => {
      setLogLevel(extName, orgLevel);
    });
  });
});
