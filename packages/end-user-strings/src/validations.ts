/**
 * Validations strings
 */

import { Validations } from "../api";

export const validations: Validations = {
  UNKNOWN_CLASS_IN_NS: {
    msg: `The "{0}" class does not exist in the "{1}" namespace`,
    code: 1001,
  },
  UNKNOWN_CLASS_WITHOUT_NS: {
    msg: `The "{0}" class does not exist, please specify a namespace`,
    code: 1002,
  },
  UNKNOWN_AGGREGATION_IN_CLASS: {
    msg: `The "{0}" aggregation does not exist in the "{1}" class`,
    code: 1003,
  },
  UNKNOWN_AGGREGATION_IN_CLASS_DIFF_NAMESPACE: {
    msg: `The "{0}" aggregation must have the same namespace as the "{1}" class`,
    code: 1004,
  },
  UNKNOWN_TAG_NAME_IN_CLASS: {
    msg: `The "{0}" name is neither a class name nor an aggregation of the "{1}" class`,
    code: 1005,
  },
  UNKNOWN_TAG_NAME_IN_NS_UNDER_CLASS: {
    msg: `The "{0}" name is neither a class name in the "{1}" namespace nor an aggregation of the "{2}" class`,
    code: 1006,
  },
  UNKNOWN_TAG_NAME_IN_NS: {
    msg: `The "{0}" name is neither a class name in the "{1}" namespace nor an aggregation of its parent tag`,
    code: 1007,
  },
  UNKNOWN_TAG_NAME_NO_NS: {
    msg: `The "{0}" name is neither a class name nor an aggregation of its parent tag, please specify a namespace`,
    code: 1008,
  },
  INVALID_AGGREGATION_CARDINALITY: {
    msg: `The aggregation "{0}" has cardinality of 0..1 and may only contain one element`,
    code: 1009,
  },
  INVALID_AGGREGATION_TYPE: {
    msg: `The class "{0}" is under the aggregation "{1}" and must match the type "{2}"`,
    code: 1010,
  },
  NON_UNIQUE_ID: { msg: `Duplicate ID: "{0}" found.`, code: 1011 },
  NON_STABLE_ID: {
    msg: `The class "{0}" must declare a non-empty ID attribute when flexEnabled is "true"`,
    code: 1012,
  },
};
