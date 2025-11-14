import { getLogger } from "../logger";
import { BUILD_CONTEXT_ERROR_MSG, SDK_MSG } from "../constant";

/**
 * Handles context-related errors by logging them with appropriate error messages.
 *
 * This function categorizes errors based on whether they have an error code:
 * - Errors with a code property are logged with SDK_MSG
 * - Errors without a code property are logged with BUILD_CONTEXT_ERROR_MSG
 *
 * @param error - The error object to handle. Must be an Error instance with an optional code property
 * @param error.code - Optional error code that determines which error message to use
 */
export function handleContextError(error: Error & { code?: string }): void {
  if (error.code) {
    getLogger().error(SDK_MSG, { error });
  } else {
    getLogger().error(BUILD_CONTEXT_ERROR_MSG, { error });
  }
}
