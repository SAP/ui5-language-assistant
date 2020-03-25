import { expect } from "chai";
import {
  buildUI5Class,
  buildUI5Namespace,
  buildUI5Interface,
  buildUI5Enum,
  buildUI5Typedef,
  buildUI5Function,
  buildUI5Property,
  buildUI5Aggregation,
  buildUI5Association,
  buildUI5Event,
  buildUI5Method,
  buildUI5Constructor,
  buildUI5Field,
  buildUI5EnumValue
} from "@ui5-editor-tools/test-utils";
import { isRootSymbol, getRootSymbolParent } from "../../src/api";
import { BaseUI5Node } from "@ui5-editor-tools/semantic-model-types";

describe("The @ui5-editor-tools/logic-utils <isRootSymbol> and <getRootSymbol> functions", () => {
  function createIts(
    symbol: BaseUI5Node,
    expectedIsRoot: boolean,
    expectedParent: BaseUI5Node
  ): void {
    it(`isRootSymbol returns ${expectedIsRoot}`, () => {
      expect(isRootSymbol(symbol)).to.equal(expectedIsRoot);
    });
    const getRootSymbolDesc = expectedIsRoot
      ? "getRootSymbol returns the same symbol"
      : "getRootSymbol returns the parent";
    it(getRootSymbolDesc, () => {
      expect(getRootSymbolParent(symbol)).to.equal(expectedParent);
    });
  }

  const testNS = buildUI5Namespace({ name: "test" });

  const testInnerNS = buildUI5Namespace({
    name: "inner",
    parent: testNS
  });

  describe("root symbols", () => {
    describe("root namespace", () => {
      createIts(testNS, true, testNS);
    });

    describe("inner namespace", () => {
      createIts(testInnerNS, true, testInnerNS);
    });

    describe("class", () => {
      const testClass = buildUI5Class({
        name: "TestClass",
        parent: testNS,
        library: "test"
      });
      createIts(testClass, true, testClass);
    });

    describe("interface", () => {
      const testInterface = buildUI5Interface({
        name: "TestInterface",
        parent: testInnerNS
      });
      createIts(testInterface, true, testInterface);
    });

    describe("enum", () => {
      const testEnum = buildUI5Enum({
        name: "TestEnum",
        parent: testInnerNS
      });
      createIts(testEnum, true, testEnum);
    });

    describe("typedef", () => {
      const testTypedef = buildUI5Typedef({
        name: "TestTypedef",
        parent: testInnerNS
      });
      createIts(testTypedef, true, testTypedef);
    });

    describe("function", () => {
      const testFunction = buildUI5Function({
        name: "TestFunction",
        parent: testInnerNS
      });
      createIts(testFunction, true, testFunction);
    });
  });

  describe("non-root symbols", () => {
    describe("symbols on classes", () => {
      const testClass = buildUI5Class({
        name: "TestClass",
        parent: testNS,
        library: "test"
      });

      describe("property", () => {
        const testProp = buildUI5Property({
          parent: testClass,
          name: "testProp"
        });
        createIts(testProp, false, testClass);
      });

      describe("field", () => {
        const testField = buildUI5Property({
          parent: testClass,
          name: "testField"
        });
        createIts(testField, false, testClass);
      });

      describe("aggregation", () => {
        const testAggregation = buildUI5Aggregation({
          parent: testClass,
          name: "testAggregation"
        });
        createIts(testAggregation, false, testClass);
      });

      describe("association", () => {
        const testAssociation = buildUI5Association({
          parent: testClass,
          name: "testAssociation"
        });
        createIts(testAssociation, false, testClass);
      });

      describe("event", () => {
        const testEvent = buildUI5Event({
          parent: testClass,
          name: "testEvent"
        });
        createIts(testEvent, false, testClass);
      });

      describe("method", () => {
        const testMethod = buildUI5Method({
          parent: testClass,
          name: "testAggregation"
        });
        createIts(testMethod, false, testClass);
      });

      describe("constructor", () => {
        const testCtor = buildUI5Constructor({
          parent: testClass
        });
        createIts(testCtor, false, testClass);
      });
    });

    describe("symbols on namespaces", () => {
      const testNS = buildUI5Namespace({ name: "test" });

      describe("field", () => {
        const testField = buildUI5Field({
          parent: testNS,
          name: "testField"
        });
        createIts(testField, false, testNS);
      });

      describe("event", () => {
        const testEvent = buildUI5Event({
          parent: testNS,
          name: "testEvent"
        });
        createIts(testEvent, false, testNS);
      });

      describe("method", () => {
        const testMethod = buildUI5Method({
          parent: testNS,
          name: "testAggregation"
        });
        createIts(testMethod, false, testNS);
      });
    });

    describe("symbols on enums", () => {
      const testEnum = buildUI5Enum({
        name: "TestEnum",
        parent: testInnerNS
      });

      describe("enum value", () => {
        const testValue = buildUI5EnumValue({
          parent: testEnum,
          name: "testValue"
        });
        createIts(testValue, false, testEnum);
      });
    });
  });
});
