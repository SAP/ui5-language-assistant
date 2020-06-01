// Validation error messages

// Unknown tag name
export const UNKNOWN_CLASS_IN_NS = `The "{0}" class does not exist in the "{1}" namespace`;
export const UNKNOWN_CLASS_WITHOUT_NS = `The "{0}" class does not exist, please specify a namespace`;
export const UNKNOWN_AGGREGATION_IN_CLASS = `The "{0}" aggregation does not exist in the "{1}" class`;
export const UNKNOWN_TAG_NAME_IN_CLASS = `The "{0}" name is neither a class name nor an aggregation in the "{1}" class`;

// Invalid aggregation cardinality
export const INVALID_AGGREGATION_CARDINALITY = `The aggregation "{0}" has cardinality of 0..1 and may only contain one element`;

export function getMessage(message: string, ...params: string[]): string {
  let result = message;
  for (let index = 0; index < params.length; index++) {
    const param = params[index];
    result = result.replace(new RegExp(`\\{${index}}`, "g"), param);
  }
  return result;
}
