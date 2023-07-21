import { parseBinding } from "../../../src/parser";
import {
  isBindingExpression,
  isMetadataPath,
  isModel,
  isBindingAllowed,
  extractBindingSyntax,
} from "../../../src/utils";

describe("expression", () => {
  describe("extractBindingSyntax", () => {
    it("empty text", () => {
      const input = " ";
      const result = extractBindingSyntax(input);
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
      const result = extractBindingSyntax(input);
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
      const result = extractBindingSyntax(input);
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
      const result = extractBindingSyntax(input);
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
      const result = extractBindingSyntax(input);
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
      const result = extractBindingSyntax(input);
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
      const result = extractBindingSyntax(input);
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
      const result = extractBindingSyntax(input);
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
      const result = extractBindingSyntax(input);
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
      const result = extractBindingSyntax(input);
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
      const result = extractBindingSyntax(input);
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
      const result = extractBindingSyntax(input);
      expect(result).toStrictEqual([
        {
          endIndex: 35,
          expression: "{parts: [' ']} $$ {path: '###'}",
          startIndex: 4,
        },
      ]);
    });
  });
  describe("isBindingExpression", () => {
    it("check binding expression {=", () => {
      const result = isBindingExpression("{=");
      expect(result).toBeTrue();
    });
    it("check  binding expression {:=", () => {
      const result = isBindingExpression("{:=");
      expect(result).toBeTrue();
    });
    it("check other false cases", () => {
      const result = isBindingExpression("{");
      expect(result).toBeFalse();
    });
  });
  describe("isBindingAllowed", () => {
    it("empty string", () => {
      const input = "  ";
      const { ast, errors } = parseBinding(input);
      const result = isBindingAllowed(input, ast.bindings[0], errors);
      expect(result).toBeTrue();
    });
    it("string value", () => {
      const input = "40";
      const { ast, errors } = parseBinding(input);
      const result = isBindingAllowed(input, ast.bindings[0], errors);
      expect(result).toBeFalse();
    });
    it("empty curly bracket without space", () => {
      const input = "{}";
      const { ast, errors } = parseBinding(input);
      const result = isBindingAllowed(input, ast.bindings[0], errors);
      expect(result).toBeTrue();
    });
    it("empty curly bracket with space", () => {
      const input = "{   }";
      const { ast, errors } = parseBinding(input);
      const result = isBindingAllowed(input, ast.bindings[0], errors);
      expect(result).toBeTrue();
    });
    it("key with colone [true]", () => {
      const input = ' {path: "some/path"}';
      const { ast, errors } = parseBinding(input);
      const result = isBindingAllowed(input, ast.bindings[0], errors);
      expect(result).toBeTrue();
    });
    it("key with colone any where [true]", () => {
      const input = ' {path "some/path", thisKey: {}}';
      const { ast, errors } = parseBinding(input);
      const result = isBindingAllowed(input, ast.bindings[0], errors);
      expect(result).toBeTrue();
    });
    it("missing colon [false]", () => {
      const input = '{path "some/path"}';
      const { ast, errors } = parseBinding(input);
      const result = isBindingAllowed(input, ast.bindings[0], errors);
      expect(result).toBeFalse();
    });
    it("contains > after first key [false]", () => {
      const input = "{i18n>myTestModel}";
      const { ast, errors } = parseBinding(input);
      const result = isBindingAllowed(input, ast.bindings[0], errors);
      expect(result).toBeFalse();
    });
    it("contains / before first key [false]", () => {
      const input = "{/oData/path/to/some/dynamic/value}";
      const { ast, errors } = parseBinding(input);
      const result = isBindingAllowed(input, ast.bindings[0], errors);
      expect(result).toBeFalse();
    });
    it("contains / after first key [false]", () => {
      const input = "{/oData/path/to/some/dynamic/value}";
      const { ast, errors } = parseBinding(input);
      const result = isBindingAllowed(input, ast.bindings[0], errors);
      expect(result).toBeFalse();
    });
  });

  describe("isModel", () => {
    it("return false if errors is undefined", () => {
      const input = "{path: 'acceptable'}";
      const { ast } = parseBinding(input);
      expect(isModel(ast.bindings[0])).toBe(false);
    });

    it("return true if model sign appears after first key", () => {
      const input = "{oData>/path/to/a/value}";
      const { ast, errors } = parseBinding(input);
      expect(isModel(ast.bindings[0], errors)).toBe(true);
    });
    it("return true if model sign as HTML equivalent appears after first key", () => {
      const input = "{oData&gt;/path/to/a/value}";
      const { ast, errors } = parseBinding(input);
      expect(isModel(ast.bindings[0], errors)).toBe(true);
    });

    it("return false if model sign does not appear after first key", () => {
      const input = "{i18n >}"; // space is not allowed
      const { ast, errors } = parseBinding(input);
      expect(isModel(ast.bindings[0], errors)).toBe(false);
    });

    it("return false if model sign is not found", () => {
      const input = "{path: 'acceptable'}";
      const { ast, errors } = parseBinding(input);
      expect(isModel(ast.bindings[0], errors)).toBe(false);
    });
    it("return false if key is with single quote", () => {
      const input = "{'path'>: ''}";
      const { ast, errors } = parseBinding(input);
      expect(isModel(ast.bindings[0], errors)).toBe(false);
    });
    it("return false if key is with double quotes", () => {
      const input = '{"path">: ""}';
      const { ast, errors } = parseBinding(input);
      expect(isModel(ast.bindings[0], errors)).toBe(false);
    });
    it("return false if key is with single quote [HTML equivalent]", () => {
      const input = "{&apos;path&apos;>: ''}";
      const { ast, errors } = parseBinding(input);
      expect(isModel(ast.bindings[0], errors)).toBe(false);
    });
    it("return false if key is with double quotes [HTML equivalent]", () => {
      const input = "{&quot;path&quot;>: ''}";
      const { ast, errors } = parseBinding(input);
      expect(isModel(ast.bindings[0], errors)).toBe(false);
    });
  });
  describe("isMetadataPath", () => {
    it("return false if errors is undefined", () => {
      const input = "{/path/to/a/value}'}";
      const { ast } = parseBinding(input);
      expect(isMetadataPath(ast.bindings[0])).toBe(false);
    });
    it("return false if there is no metadata separator", () => {
      const input = "{path: 'acceptable'}";
      const { ast, errors } = parseBinding(input);
      expect(isMetadataPath(ast.bindings[0], errors)).toBe(false);
    });

    it("return true if the metadata separator is before adjacent first key", () => {
      const input = "{/path/to/a/value}";
      const { ast, errors } = parseBinding(input);
      expect(isMetadataPath(ast.bindings[0], errors)).toBe(true);
    });

    it("return true if the metadata separator is after adjacent first key", () => {
      const input = "{path/to/a/value}";
      const { ast, errors } = parseBinding(input);
      expect(isMetadataPath(ast.bindings[0], errors)).toBe(true);
    });
    it("return true if the metadata separator as HTML equivalent is before adjacent first key", () => {
      const input = "{&#47;path/to/a/value}";
      const { ast, errors } = parseBinding(input);
      expect(isMetadataPath(ast.bindings[0], errors)).toBe(true);
    });

    it("return true if the metadata separator as HTML equivalent is after adjacent first key", () => {
      const input = "{path&#x2F;to/a/value}";
      const { ast, errors } = parseBinding(input);
      expect(isMetadataPath(ast.bindings[0], errors)).toBe(true);
    });
  });
});
