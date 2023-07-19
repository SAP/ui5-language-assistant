import { extractBindingExpression } from "../../../src/utils";

describe("expression", () => {
  describe("extractBindingExpression", () => {
    it("empty text", () => {
      const input = " ";
      const result = extractBindingExpression(input);
      expect(result).toStrictEqual([
        {
          startIndex: 0,
          endIndex: 0,
          expression: " ",
        },
      ]);
    });
    it("text and binding syntax", () => {
      const input = 'some text here {path: "some/path"} some text here too';
      const result = extractBindingExpression(input);
      expect(result).toStrictEqual([
        {
          startIndex: 15,
          endIndex: 34,
          expression: '{path: "some/path"}',
        },
      ]);
    });
    it("escape char and binding syntax", () => {
      const input = "{path: ''} Euro \\{ ok? ";
      const result = extractBindingExpression(input);
      expect(result).toStrictEqual([
        {
          startIndex: 0,
          endIndex: 10,
          expression: "{path: ''}",
        },
      ]);
    });
    it("text with escaped brackets and binding syntax", () => {
      const input =
        'some text \\{ and \\[ some \\} text \\] here too and here too {path: "some/path"} some text \\{ and \\[ some \\} text \\] here too';
      const result = extractBindingExpression(input);
      expect(result).toStrictEqual([
        {
          startIndex: 58,
          endIndex: 77,
          expression: '{path: "some/path"}',
        },
      ]);
    });
    it("binding syntax only [missing closing curly bracket]", () => {
      const input = '{path: "test-value", ,   ';
      const result = extractBindingExpression(input);
      expect(result).toStrictEqual([
        {
          startIndex: 0,
          endIndex: 25,
          expression: '{path: "test-value", ,   ',
        },
      ]);
    });
    it("binding syntax with multiple opening and closing brackets", () => {
      const input =
        "some text \\{ and \\[ {events: {a: {}}, b {}} some \\] text \\}";
      const result = extractBindingExpression(input);
      expect(result).toStrictEqual([
        {
          startIndex: 20,
          endIndex: 43,
          expression: "{events: {a: {}}, b {}}",
        },
      ]);
    });
    it("binding syntax only", () => {
      const input = `{
        path:'/Travel',
        parameters : {
            $filter : 'TravelStatus_code eq 'O' and IsActiveEntity eq false or SiblingEntity/IsActiveEntity eq null',
            $orderby : 'TotalPrice desc'
        }
			}`;
      const result = extractBindingExpression(input);
      expect(result).toStrictEqual([
        {
          startIndex: 0,
          endIndex: 222,
          expression: input,
        },
      ]);
    });
    it("text and multi binding syntaxes", () => {
      const input = `some text \\{ and \\[ some \\} text \\] here {path:'gender', formatter:'.myGenderFormatter'} also some text \\{ here and here \\[ too \\} text \\] in between {firstName}, \\{ and \\[ some \\} \\] {lastName}. There are some text \\{ here \\[ and here \\} \\]
      {
        events: {
          key01: "abc",
        }
			}
      might be here 
      \\{ \\[ some \\} text \\]
        `;
      const result = extractBindingExpression(input);
      expect(result).toStrictEqual([
        {
          endIndex: 88,
          expression: "{path:'gender', formatter:'.myGenderFormatter'}",
          startIndex: 41,
        },
        {
          endIndex: 161,
          expression: "{firstName}",
          startIndex: 150,
        },
        {
          endIndex: 194,
          expression: "{lastName}",
          startIndex: 184,
        },
        {
          endIndex: 306,
          expression:
            '{\n        events: {\n          key01: "abc",\n        }\n\t\t\t}',
          startIndex: 248,
        },
      ]);
    });
    it("two property binding info", () => {
      const input = `
      {
        events: {
          key01: "abc",
        }
			}
      {
        path: 'some/value',
      }
      `;
      const result = extractBindingExpression(input);
      expect(result).toStrictEqual([
        {
          endIndex: 109,
          expression:
            "{\n        events: {\n          key01: \"abc\",\n        }\n\t\t\t}\n      {\n        path: 'some/value',\n      }",
          startIndex: 7,
        },
      ]);
    });
    it("two property binding info [missing brackets]", () => {
      const input = `
      {
        events: 
          key01: "abc",
        }
			}
      {
        path: '',
        events: {
      }
      `;
      const result = extractBindingExpression(input);
      expect(result).toStrictEqual([
        {
          endIndex: 116,
          expression:
            "{\n        events: \n          key01: \"abc\",\n        }\n\t\t\t}\n      {\n        path: '',\n        events: {\n      }",
          startIndex: 7,
        },
      ]);
    });
    it("two property binding info", () => {
      const input = `{path:'' } , {events: { }}`;
      const result = extractBindingExpression(input);
      expect(result).toStrictEqual([
        {
          endIndex: 26,
          expression: "{path:'' } , {events: { }}",
          startIndex: 0,
        },
      ]);
    });
    it("two property binding info [with special chars]", () => {
      const input = `??? {parts: [' ']} $$ {path: '###'} >>>`;
      const result = extractBindingExpression(input);
      expect(result).toStrictEqual([
        {
          endIndex: 35,
          expression: "{parts: [' ']} $$ {path: '###'}",
          startIndex: 4,
        },
      ]);
    });
  });
});
