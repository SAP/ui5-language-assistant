import {
  buildUI5Class,
  buildUI5Association,
  expectUnsortedEquality,
} from "@ui5-language-assistant/test-utils";
import { map } from "lodash";
import { flattenAssociations } from "../../src/api";

describe("The @ui5-language-assistant/logic-utils <flattenAssociation> function", () => {
  const assocA1 = buildUI5Association({ name: "assocA1" });
  const assocA2 = buildUI5Association({ name: "assocA2" });
  const clazzA = buildUI5Class({
    name: "A",
    library: "sap.ui.core",
    associations: [assocA1, assocA2],
  });

  const assocB1 = buildUI5Association({ name: "assocB1" });
  const assocB2 = buildUI5Association({ name: "assocB2" });
  const clazzB = buildUI5Class({
    name: "B",
    extends: clazzA,
    associations: [assocB1, assocB2],
  });

  const clazzC = buildUI5Class({ name: "C", extends: clazzA });

  it("direct associations", () => {
    const actualNames = map(flattenAssociations(clazzA), "name");
    expectUnsortedEquality(actualNames, ["assocA1", "assocA2"]);
  });

  it("borrowed associations", () => {
    const actualNames = map(flattenAssociations(clazzC), "name");
    expectUnsortedEquality(actualNames, ["assocA1", "assocA2"]);
  });

  it("direct and borrowed associations", () => {
    const actualNames = map(flattenAssociations(clazzB), "name");
    expectUnsortedEquality(actualNames, [
      "assocA1",
      "assocA2",
      "assocB1",
      "assocB2",
    ]);
  });
});
