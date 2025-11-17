import { handleContextError } from "../../../src/utils";
import { getLogger } from "../../../src/logger";
import { BUILD_CONTEXT_ERROR_MSG, SDK_MSG } from "../../../src/constant";

// Mock the logger module
jest.mock("../../../src/logger");

describe("handleContextError", () => {
  let mockLogger: jest.Mocked<{
    error: jest.Mock;
  }>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create a mock logger with an error method
    mockLogger = {
      error: jest.fn(),
    };

    // Make getLogger return our mock logger
    (getLogger as jest.Mock).mockReturnValue(mockLogger);
  });

  it("should log error with SDK_MSG", () => {
    // Arrange
    const errorWithCode = Object.assign(new Error("Connection failed"), {
      code: "ECONNREFUSED",
    });

    // Act
    handleContextError(errorWithCode);

    // Assert
    expect(getLogger).toHaveBeenCalled();
    expect(mockLogger.error).toHaveBeenCalledTimes(1);
    expect(mockLogger.error).toHaveBeenCalledWith(SDK_MSG, {
      error: errorWithCode,
    });
  });
  it("should log error with BUILD_CONTEXT_ERROR_MSG", () => {
    // Arrange
    const errorWithoutCode = new Error("Build failed");

    // Act
    handleContextError(errorWithoutCode);

    // Assert
    expect(getLogger).toHaveBeenCalled();
    expect(mockLogger.error).toHaveBeenCalledTimes(1);
    expect(mockLogger.error).toHaveBeenCalledWith(BUILD_CONTEXT_ERROR_MSG, {
      error: errorWithoutCode,
    });
  });
});
