/**
 * Build a message from given template and arguments.
 */
export function buildMessage(template: string, ...params: string[]): string;

type validationText = {
  msg: string;
  code: number;
};

type commandText = {
  command: string;
  title: string;
};

type Validations = {
  INVALID_AGGREGATION_CARDINALITY: validationText;
  INVALID_AGGREGATION_TYPE: validationText;
  NON_STABLE_ID: validationText;
  NON_UNIQUE_ID: validationText;
  UNKNOWN_AGGREGATION_IN_CLASS: validationText;
  UNKNOWN_AGGREGATION_IN_CLASS_DIFF_NAMESPACE: validationText;
  UNKNOWN_CLASS_IN_NS: validationText;
  UNKNOWN_CLASS_WITHOUT_NS: validationText;
  UNKNOWN_TAG_NAME_IN_CLASS: validationText;
  UNKNOWN_TAG_NAME_IN_NS: validationText;
  UNKNOWN_TAG_NAME_IN_NS_UNDER_CLASS: validationText;
  UNKNOWN_TAG_NAME_NO_NS: validationText;
};

type Commands = {
  QUICK_FIX_STABLE_ID_ERROR: commandText;
  QUICK_FIX_STABLE_ID_FILE_ERRORS: commandText;
};

/**
 * Templates and error codes for LSP Diagnostics issues.
 */
export declare const validations: Validations;

/**
 * Command names and titles for LSP Commands.
 */
export declare const commands: Commands;

/**
 * Used for LSP Diagnostic issue to describe the source of the diagnostic.
 */
export declare const DIAGNOSTIC_SOURCE: string;
