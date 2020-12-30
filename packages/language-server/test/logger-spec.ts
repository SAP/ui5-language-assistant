import { expect } from "chai";
import { restore, spy } from "sinon";
import { getLogger, getLogLevel, setLogLevel } from "../src/logger";
import { LogLevel } from "@vscode-logging/logger";

describe("the Language Server Logger", () => {
  let errorSpy;

  beforeEach(() => {
    errorSpy = spy(console, "error");
  });

  afterEach(() => {
    restore();
  });

  it("supports structured JSON logging", async () => {
    getLogger().error("hello world", { a: 1, b: [1, 2, 3] });
    const logEntry = errorSpy.args[0];
    const jsonLogEntry = JSON.parse(logEntry);
    expect(jsonLogEntry).to.have.property("a", 1);
    expect(jsonLogEntry).to.have.deep.property("b", [1, 2, 3]);
  });

  context("log level", () => {
    let orgLevel: LogLevel;

    before(() => {
      orgLevel = getLogLevel();
    });

    it("supports changing the log level", async () => {
      setLogLevel("fatal");
      getLogger().error(
        "`error` is lower than `fatal` so no logging should happen"
      );
      expect(errorSpy).to.have.not.been.called;
      getLogger().fatal("`fatal` should cause logging to the console");
      expect(errorSpy).to.have.been.called;
    });

    after(() => {
      setLogLevel(orgLevel);
    });
  });

  it("removes possible personal information from the logs", async () => {
    getLogger().error("hello world", {
      a: 1,
      b: 2,
      uri: "c:\\users\\donald_trump",
    });
    const logEntry = errorSpy.args[0];
    const jsonLogEntry = JSON.parse(logEntry);
    expect(jsonLogEntry).to.not.have.property("uri");
  });

  it("removes possible personal information from the logs **deeply**", async () => {
    getLogger().error("hello world", {
      a: 1,
      b: 2,
      obj1: { uri: "c:\\users\\donald_trump" },
    });
    const logEntry = errorSpy.args[0];
    const jsonLogEntry = JSON.parse(logEntry);
    expect(jsonLogEntry).to.not.have.deep.property("uri");
  });
});
