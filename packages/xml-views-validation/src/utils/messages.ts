// Validation error messages

// Unknown tag name
export const UNKNOWN_CLASS_IN_NS = `The "{0}" class does not exist in the "{1}" namespace`;
export const UNKNOWN_CLASS_WITHOUT_NS = `The "{0}" class does not exist, please specify a namespace`;
export const UNKNOWN_AGGREGATION_IN_CLASS = `The "{0}" aggregation does not exist in the "{1}" class`;
export const UNKNOWN_AGGREGATION_IN_CLASS_DIFF_NAMESPACE = `The "{0}" aggregation must have the same namespace as the "{1}" class`;
export const UNKNOWN_TAG_NAME_IN_CLASS = `The "{0}" name is neither a class name nor an aggregation of the "{1}" class`;
export const UNKNOWN_TAG_NAME_IN_NS_UNDER_CLASS = `The "{0}" name is neither a class name in the "{1}" namespace nor an aggregation of the "{2}" class`;
export const UNKNOWN_TAG_NAME_IN_NS = `The "{0}" name is neither a class name in the "{1}" namespace nor an aggregation of its parent tag`;
export const UNKNOWN_TAG_NAME_NO_NS = `The "{0}" name is neither a class name nor an aggregation of its parent tag, please specify a namespace`;

export function getMessage(message: string, ...params: string[]): string {
  let result = message;
  for (let index = 0; index < params.length; index++) {
    const param = params[index];
    result = result.replace(new RegExp(`\\{${index}}`, "g"), param);
  }
  return result;
}
