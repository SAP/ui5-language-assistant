/**
 * Build a message from given template and arguments.
 * For example:
 * We call to this function with template 'Hello {0}` and the argument 'World'.
 * The result will be 'Hello World'.
 */
export function buildMessage(template: string, ...params: string[]): string;

type validationText = {
  msg: string;
  code: number;
};

type commandText = {
  name: string;
  title: string;
};

type Validations = {
  INVALID_AGGREGATION_CARDINALITY: validationText;
  INVALID_AGGREGATION_TYPE: validationText;
  NON_STABLE_ID: validationText;
  NON_UNIQUE_ID: validationText;
  NON_UNIQUE_ID_RELATED_INFO: validationText;
  UNKNOWN_AGGREGATION_IN_CLASS: validationText;
  UNKNOWN_AGGREGATION_IN_CLASS_DIFF_NAMESPACE: validationText;
  UNKNOWN_CLASS_IN_NS: validationText;
  UNKNOWN_CLASS_WITHOUT_NS: validationText;
  UNKNOWN_TAG_NAME_IN_CLASS: validationText;
  UNKNOWN_TAG_NAME_IN_NS: validationText;
  UNKNOWN_TAG_NAME_IN_NS_UNDER_CLASS: validationText;
  UNKNOWN_TAG_NAME_NO_NS: validationText;
  HARDCODED_I18N_STRING: validationText;
};

type Commands = {
  QUICK_FIX_STABLE_ID_ERROR: commandText;
  QUICK_FIX_STABLE_ID_FILE_ERRORS: commandText;
  QUICK_FIX_HARDCODED_I18N_STRING_ERROR: commandText;
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
