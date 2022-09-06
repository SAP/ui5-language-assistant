import { getLogger, getLogLevel, setLogLevel } from "../src/logger";
import { LogLevel } from "@vscode-logging/logger";
import { validLoggingLevelValues } from "@ui5-language-assistant/settings";
import { SpyInstance, vi } from "vitest";
describe("the Language Server Logger", () => {
  let errorSpy;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, "error");
  });

  afterEach(() => {
    errorSpy.mockReset();
  });

  it("supports structured JSON logging", async () => {
    getLogger().error("hello world", { a: 1, b: [1, 2, 3] });
    const logEntry = errorSpy.calls[0];
    const jsonLogEntry = JSON.parse(logEntry);
    expect(jsonLogEntry).to.have.property("a", 1);
    expect(jsonLogEntry).to.have.deep.property("b", [1, 2, 3]);
  });

  describe("log level", () => {
    let orgLevel: LogLevel;

    beforeEach(() => {
      orgLevel = getLogLevel();
    });

    it("supports changing the log level", async () => {
      setLogLevel("fatal");
      getLogger().error(
        "`error` is lower than `fatal` so no logging should happen"
      );
      expect(errorSpy).toBeCalledTimes(0);
      getLogger().fatal("`fatal` should cause logging to the console");
      expect(errorSpy).toBeCalled();
    });

    it("does not allow changing to an **unknown** logLevel", async () => {
      // "Verbose" is not a valid log level for the language server
      setLogLevel("Verbose" as "trace");
      const currentLogLevel = getLogLevel();
      expect(currentLogLevel).to.not.equal("Verbose");
      expect(validLoggingLevelValues[currentLogLevel]).to.be.true;
    });

    afterEach(() => {
      setLogLevel(orgLevel);
    });
  });
});
