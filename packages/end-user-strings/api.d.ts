export function buildMessage(template: string, ...params: string[]): string;

type validationStrings = {
  msg: string;
  code: number;
};

type quickFixStrings = {
  command: string;
  title: string;
};

type Validations = {
  INVALID_AGGREGATION_CARDINALITY: validationStrings;
  INVALID_AGGREGATION_TYPE: validationStrings;
  NON_STABLE_ID: validationStrings;
  NON_UNIQUE_ID: validationStrings;
  UNKNOWN_AGGREGATION_IN_CLASS: validationStrings;
  UNKNOWN_AGGREGATION_IN_CLASS_DIFF_NAMESPACE: validationStrings;
  UNKNOWN_CLASS_IN_NS: validationStrings;
  UNKNOWN_CLASS_WITHOUT_NS: validationStrings;
  UNKNOWN_TAG_NAME_IN_CLASS: validationStrings;
  UNKNOWN_TAG_NAME_IN_NS: validationStrings;
  UNKNOWN_TAG_NAME_IN_NS_UNDER_CLASS: validationStrings;
  UNKNOWN_TAG_NAME_NO_NS: validationStrings;
};

type QuickFixCommands = {
  STABLE_ID_ERROR: quickFixStrings;
  STABLE_ID_FILE: quickFixStrings;
};

export const validations: Validations;
export const quickFixCommands: QuickFixCommands;
export declare const DIAGNOSTIC_SOURCE: string;
