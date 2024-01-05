import { getLogger, getLogLevel, setLogLevel } from "../../src/api";
import { LogLevel } from "@vscode-logging/logger";
import { validLoggingLevelValues } from "@ui5-language-assistant/settings";

describe("Logger", () => {
  let errorSpy;
  const name = "dummyName";
  beforeAll(() => {
    // mockReturnValue to avoid log miss in console
    errorSpy = jest.spyOn(console, "error").mockReturnValue();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("supports structured JSON logging", async () => {
    getLogger(name).error("hello world", { a: 1, b: [1, 2, 3] });
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
      // mockReturnValue to avoid log miss in console
      jest.spyOn(console, "error").mockReturnValue();
      setLogLevel(name, "fatal");
      getLogger(name).error(
        "`error` is lower than `fatal` so no logging should happen"
      );
      expect(errorSpy).not.toHaveBeenCalled();
      getLogger(name).fatal("`fatal` should cause logging to the console");
      expect(errorSpy).toHaveBeenCalled();
    });

    it("does not allow changing to an **unknown** logLevel", async () => {
      // "Verbose" is not a valid log level for the language server
      setLogLevel(name, "Verbose" as "trace");
      const currentLogLevel = getLogLevel();
      expect(currentLogLevel).not.toEqual("Verbose");
      expect(validLoggingLevelValues[currentLogLevel]).toBeTrue();
    });

    afterEach(() => {
      setLogLevel(name, orgLevel);
    });
  });
});
