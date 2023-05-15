import { expect } from "chai";
import {
  extractBindingExpression,
  isBindingExpression,
  isPropertyBindingInfo,
} from "../../src/utils";
import { parsePropertyBindingInfo } from "@ui5-language-assistant/binding-parser";

describe("expression", () => {
  context("isBindingExpression", () => {
    it("check binding expression {=", () => {
      const result = isBindingExpression("{=");
      expect(result).to.be.true;
    });
    it("check  binding expression {:=", () => {
      const result = isBindingExpression("{:=");
      expect(result).to.be.true;
    });
    it("check other false cases", () => {
      const result = isBindingExpression("{");
      expect(result).to.be.false;
    });
  });
  context.only("extractBindingExpression", () => {
    it("text and binding syntax", () => {
      const input = 'some text here {path: "some/path"} some text here too';
      const result = extractBindingExpression(input);
      expect(result).to.deep.equal([{
        startIndex: 15,
        endIndex: 33,
        expression: '{path: "some/path"}',
      }]);
    });
    it("text with escaped brackets and binding syntax", () => {
      const input =
        'some text \\{ and \\[ some \\} text \\] here too and here too {path: "some/path"} some text \\{ and \\[ some \\} text \\] here too';
      const result = extractBindingExpression(input);
      expect(result).to.deep.equal([{
        startIndex: 58,
        endIndex: 76,
        expression: '{path: "some/path"}',
      }]);
    });
    it("binding syntax only [missing closing curly bracket]", () => {
      const input = '{path: "test-value", ,   ';
      const result = extractBindingExpression(input);
      expect(result).to.deep.equal([{
        startIndex: 0,
        endIndex: 25,
        expression: '{path: "test-value", ,   ',
      }]);
    });
    it("binding syntax only [simple]", () => {
      const input = "{events: {a: {}}, {}}";
      const result = extractBindingExpression(input);
      expect(result).to.deep.equal([{
        startIndex: 0,
        endIndex: 20,
        expression: "{events: {a: {}}, {}}",
      }]);
    });
    it.only("binding syntax only", () => {
      const input = `{
        path:'/Travel',
        parameters : {
            $filter : 'TravelStatus_code eq 'O' and IsActiveEntity eq false or SiblingEntity/IsActiveEntity eq null',
            $orderby : 'TotalPrice desc'
        }
			}`;
      const result = extractBindingExpression(input);
      expect(result).to.deep.equal([{
        startIndex: 0,
        endIndex: 221,
        expression: input,
      }]);
    });
    it("text and multi binding syntaxes", () => {
      const input =
        "some text here {path:'gender', formatter:'.myGenderFormatter'} some in between {firstName}, {lastName} some here too";
      const result = extractBindingExpression(input);
      expect(result).to.deep.equal([
        {
          endIndex: 62,
          expression: "{path:'gender', formatter:'.myGenderFormatter'}",
          startIndex: 15,
        },
        {
          endIndex: 90,
          expression: "{firstName}",
          startIndex: 79,
        },
        {
          endIndex: 102,
          expression: "{lastName}",
          startIndex: 92,
        },
      ]);
    });
  });
  context("isPropertyBindingInfo", () => {
    it("empty string", () => {
      const input = "  ";
      const { ast } = parsePropertyBindingInfo(input);
      const result = isPropertyBindingInfo(ast, input);
      expect(result).to.be.true;
    });
    it("string value", () => {
      const input = "40";
      const { ast } = parsePropertyBindingInfo(input);
      const result = isPropertyBindingInfo(ast, input);
      expect(result).to.be.false;
    });
    it("empty curly bracket without space", () => {
      const input = "{}";
      const { ast } = parsePropertyBindingInfo(input);
      const result = isPropertyBindingInfo(ast, input);
      expect(result).to.be.true;
    });
    it("empty curly bracket with space", () => {
      const input = "{   }";
      const { ast } = parsePropertyBindingInfo(input);
      const result = isPropertyBindingInfo(ast, input);
      expect(result).to.be.true;
    });
    it("key with colone [true]", () => {
      const input = ' {path: "some/path"}';
      const { ast } = parsePropertyBindingInfo(input);
      const result = isPropertyBindingInfo(ast, input);
      expect(result).to.be.true;
    });
    it("key with colone any where [true]", () => {
      const input = ' {path "some/path", thisKey: {}}';
      const { ast } = parsePropertyBindingInfo(input);
      const result = isPropertyBindingInfo(ast, input);
      expect(result).to.be.true;
    });
    it("missing colon [false]", () => {
      const input = '{path "some/path"}';
      const { ast } = parsePropertyBindingInfo(input);
      const result = isPropertyBindingInfo(ast, input);
      expect(result).to.be.false;
    });
    it("contains > [false]", () => {
      const input = "{i18n>myTestModel}";
      const { ast } = parsePropertyBindingInfo(input);
      const result = isPropertyBindingInfo(ast, input);
      expect(result).to.be.false;
    });
  });
});
