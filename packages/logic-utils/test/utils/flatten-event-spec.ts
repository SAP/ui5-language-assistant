import {
  buildUI5Class,
  buildUI5Event,
  expectUnsortedEquality
} from "@ui5-language-assistant/test-utils";
import { map } from "lodash";
import { flattenEvents } from "../../src/api";

describe('"The @ui5-language-assistant/logic-utils <flattenProperties> function"', function() {
  const eventA1 = buildUI5Event({ name: "eventA1" });
  const eventA2 = buildUI5Event({ name: "eventA2" });
  const clazzA = buildUI5Class({
    name: "A",
    library: "sap.ui.core",
    events: [eventA1, eventA2]
  });

  const eventB1 = buildUI5Event({ name: "eventB1" });
  const eventB2 = buildUI5Event({ name: "eventB2" });
  const clazzB = buildUI5Class({
    name: "B",
    extends: clazzA,
    events: [eventB1, eventB2]
  });

  const clazzC = buildUI5Class({ name: "C", extends: clazzA });

  it("direct events", () => {
    const actualNames = map(flattenEvents(clazzA), "name");
    expectUnsortedEquality(actualNames, ["eventA1", "eventA2"]);
  });

  it("borrowed events", () => {
    const actualNames = map(flattenEvents(clazzC), "name");
    expectUnsortedEquality(actualNames, ["eventA1", "eventA2"]);
  });

  it("direct and borrowed events", () => {
    const actualNames = map(flattenEvents(clazzB), "name");
    expectUnsortedEquality(actualNames, [
      "eventA1",
      "eventA2",
      "eventB1",
      "eventB2"
    ]);
  });
});
