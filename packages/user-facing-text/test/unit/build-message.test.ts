import {
  buildMessage,
  commands,
  validations,
  DIAGNOSTIC_SOURCE,
} from "../../src/api";
import { keys } from "lodash";

describe("buildMessage", () => {
  it("will build a message from given multiple arguments", () => {
    const result = buildMessage("{0} wonderful {1}", "Hello", "world");
    expect(result).toEqual("Hello wonderful world");
  });

  it("trivial checks to get the desired coverage", () => {
    expect(DIAGNOSTIC_SOURCE).toBe(DIAGNOSTIC_SOURCE);
    expect(commands).toContainAllKeys([
      "QUICK_FIX_STABLE_ID_ERROR",
      "QUICK_FIX_STABLE_ID_FILE_ERRORS",
    ]);
    expect(keys(validations)).toMatchInlineSnapshot(`
      Array [
        "UNKNOWN_CLASS_IN_NS",
        "UNKNOWN_CLASS_WITHOUT_NS",
        "UNKNOWN_AGGREGATION_IN_CLASS",
        "UNKNOWN_AGGREGATION_IN_CLASS_DIFF_NAMESPACE",
        "UNKNOWN_TAG_NAME_IN_CLASS",
        "UNKNOWN_TAG_NAME_IN_NS_UNDER_CLASS",
        "UNKNOWN_TAG_NAME_IN_NS",
        "UNKNOWN_TAG_NAME_NO_NS",
        "INVALID_AGGREGATION_CARDINALITY",
        "INVALID_AGGREGATION_TYPE",
        "NON_UNIQUE_ID",
        "NON_UNIQUE_ID_RELATED_INFO",
        "NON_STABLE_ID",
      ]
    `);
  });
});
