import { getLogger } from "../../src/logger";
import { PACKAGE_NAME } from "../../src/constants";
import * as loggerModule from "@ui5-language-assistant/logger";
import { ILogger } from "@ui5-language-assistant/logger";

// Mock the logger module
jest.mock("@ui5-language-assistant/logger", () => ({
  getLogger: jest.fn(),
}));

describe("getLogger", () => {
  let mockLogger: ILogger;
  let mockGetLogger: jest.MockedFunction<typeof loggerModule.getLogger>;

  beforeEach(() => {
    // Create a mock logger object with the expected ILogger interface
    mockLogger = {
      fatal: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
    } as ILogger;

    // Reset the mock and set up default implementation
    mockGetLogger = loggerModule.getLogger as jest.MockedFunction<
      typeof loggerModule.getLogger
    >;
    mockGetLogger.mockReset();
    mockGetLogger.mockReturnValue(mockLogger);
  });

  describe("getLogger", () => {
    it("should return a logger instance", () => {
      const logger = getLogger();

      expect(logger).toBeDefined();
      expect(logger).toBe(mockLogger);
    });

    it("should call the underlying logger module with the correct package name", () => {
      getLogger();

      expect(mockGetLogger).toHaveBeenCalledTimes(1);
      expect(mockGetLogger).toHaveBeenCalledWith(PACKAGE_NAME);
    });
  });
});
