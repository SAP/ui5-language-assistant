import { SPLIT_ATTRIBUTE_ON_FORMAT } from "../../../src/constants";
import { formatRange, formatDocument } from "../../../src/formatter";
import {
  TextDocument,
  Position,
  Range,
  TextEdit,
  window,
  FormattingOptions,
  workspace,
  WorkspaceConfiguration,
} from "vscode";

describe("document formatter", () => {
  const textEditSpy = jest.spyOn(TextEdit, "replace");
  const showErrorSpy = jest.spyOn(window, "showErrorMessage");
  const getConfigSpy = jest.spyOn(workspace, "getConfiguration");

  beforeEach(() => {
    jest.resetAllMocks();
    textEditSpy.mockImplementation((range, text) => ({ newText: text, range }));
  });

  const document: TextDocument = {
    getText: jest.fn(),
    positionAt: jest.fn(),
  } as unknown as TextDocument;

  const range: Range = new Range(0, 0, 0, 10);

  describe("successful format", () => {
    const assert = (text: string, opt?: FormattingOptions) => {
      const getTextSpy = jest.spyOn(document, "getText").mockReturnValue(text);
      const result = formatRange(document, range, opt);
      expect(showErrorSpy).not.toHaveBeenCalled();
      const { newText, range: resultRange } = result[0];
      expect(resultRange).toStrictEqual(range);
      expect(getTextSpy).toHaveBeenCalledWith(range);
      return newText;
    };

    it("format with default options", () => {
      const result = assert(`
            <tag attr1="" attr2 = "">
            <nested>
            content
            </nested>
            </tag >
            `);
      expect(result).toMatchInlineSnapshot(`
        "<tag attr1=\\"\\" attr2=\\"\\">
            <nested>content</nested>
        </tag>
        "
      `);
    });

    it("format with custom tab size in options", () => {
      const result = assert(
        `
            <tag attr1="" attr2 = "">
            <nested>
            content
            </nested>
            <selfclosing />
            </tag >
            `,
        { tabSize: 8, insertSpaces: true }
      );
      expect(result).toMatchInlineSnapshot(`
        "<tag attr1=\\"\\" attr2=\\"\\">
                <nested>content</nested>
                <selfclosing />
        </tag>
        "
      `);
    });

    it("format with attributes splitting", () => {
      const getSpy = jest.fn().mockReturnValue(true);
      getConfigSpy.mockReturnValue({
        get: getSpy,
      } as unknown as WorkspaceConfiguration);

      const result = assert(
        `
              <tag attr1="" attr2 = "">
              content
              </tag >
              `
      );
      expect(result).toMatchInlineSnapshot(`
        "<tag
            attr1=\\"\\"
            attr2=\\"\\"
        >
            content
        </tag>
        "
      `);
      expect(getSpy).toHaveBeenCalledWith(SPLIT_ATTRIBUTE_ON_FORMAT);
    });

    it("format document", () => {
      const text = `
        <tag attr1="" attr2 = "">
        </tag >
        `;
      jest.spyOn(document, "getText").mockReturnValue(text);
      const posSpy = jest
        .spyOn(document, "positionAt")
        .mockReturnValue(new Position(0, 100));
      const result = formatDocument(document);
      expect(showErrorSpy).not.toHaveBeenCalled();
      expect(posSpy).toHaveBeenCalledWith(text.length);
      expect(result[0]).toMatchInlineSnapshot(`
        Object {
          "newText": "<tag attr1=\\"\\" attr2=\\"\\" />
        ",
          "range": Range {
            "end": Position {
              "character": 100,
              "line": 0,
            },
            "start": Position {
              "character": 0,
              "line": 0,
            },
          },
        }
      `);
    });

    describe("error cases", () => {
      beforeEach(() => jest.resetAllMocks());
      const assert = (opt?: FormattingOptions) => {
        jest.spyOn(document, "getText").mockReturnValue("<<tag");
        formatRange(document, range, opt);
      };

      it("invalid selection range", () => {
        assert({ tabSize: 4, insertSpaces: true });
        expect(showErrorSpy).toHaveBeenCalledWith(
          "Formatting failed: invalid selection range. Selected range must start with opening tag and end with the matching closing tag."
        );
      });

      it("invalid syntax", () => {
        assert();
        expect(showErrorSpy.mock.calls[0][0]).toStartWith(
          "Formatting failed: syntax errors."
        );
      });
    });
  });
});
