/**
 * Validations text
 */

import { Validations } from "../api";

// ESLint will remove the ":string" causing an error in "implementation-matches-public-api.ts"
// eslint-disable-next-line @typescript-eslint/no-inferrable-types
export const DIAGNOSTIC_SOURCE: string = "UI5 Language Assistant";

export const validations: Validations = {
  UNKNOWN_CLASS_IN_NS: {
    msg: `The "{0}" class doesn't exist in the "{1}" namespace.`,
    code: 1001,
  },
  UNKNOWN_CLASS_WITHOUT_NS: {
    msg: `The "{0}" class doesn't exist. Enter a namespace.`,
    code: 1002,
  },
  UNKNOWN_AGGREGATION_IN_CLASS: {
    msg: `The "{0}" aggregation doesn't exist in the "{1}" class.`,
    code: 1003,
  },
  UNKNOWN_AGGREGATION_IN_CLASS_DIFF_NAMESPACE: {
    msg: `The "{0}" aggregation must have the same namespace as the "{1}" class.`,
    code: 1004,
  },
  UNKNOWN_TAG_NAME_IN_CLASS: {
    msg: `The "{0}" name is neither a class name nor an aggregation of the "{1}" class.`,
    code: 1005,
  },
  UNKNOWN_TAG_NAME_IN_NS_UNDER_CLASS: {
    msg: `The "{0}" name is neither a class name in the "{1}" namespace nor an aggregation of the "{2}" class.`,
    code: 1006,
  },
  UNKNOWN_TAG_NAME_IN_NS: {
    msg: `The "{0}" name is neither a class name in the "{1}" namespace nor an aggregation of its parent tag.`,
    code: 1007,
  },
  UNKNOWN_TAG_NAME_NO_NS: {
    msg: `The "{0}" name is neither a class name nor an aggregation of its parent tag. Enter a namespace.`,
    code: 1008,
  },
  INVALID_AGGREGATION_CARDINALITY: {
    msg: `The "{0}" aggregation has a cardinality of 0..1 and may only contain one element.`,
    code: 1009,
  },
  INVALID_AGGREGATION_TYPE: {
    msg: `The "{0}" class is under the "{1}" aggregation and must match the "{2}" type.`,
    code: 1010,
  },
  NON_UNIQUE_ID: {
    msg: `Select a unique ID. The current "{0}" ID has already been used.`,
    code: 1011,
  },
  NON_UNIQUE_ID_RELATED_INFO: {
    msg: `An identical ID is also used here.`,
    code: NaN,
  },
  NON_STABLE_ID: {
    msg: `The "{0}" class can't have an empty ID attribute when flexEnabled is "true".`,
    code: 1012,
  },
};
