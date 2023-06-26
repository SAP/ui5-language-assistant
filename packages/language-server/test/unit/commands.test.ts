import { Position, Range } from "vscode-languageserver-types";
import { QuickFixStableIdInfo } from "@ui5-language-assistant/xml-views-quick-fix/src/quick-fix-stable-id";
import { commands } from "@ui5-language-assistant/user-facing-text";
import { LSPConnection, executeCommand } from "../../src/commands";
import * as swa from "../../src/swa";

const trackSpy = jest.spyOn(swa, "track");

describe("Language Server commands", () => {
  let applySpy: jest.SpyInstance;
  let connection: LSPConnection;

  beforeAll(() => {
    connection = {
      workspace: {
        applyEdit: jest.fn(),
      },
    } as unknown as LSPConnection;
    applySpy = jest.spyOn(connection.workspace, "applyEdit");
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("undefined args", () => {
    executeCommand(connection, {
      command: "dummy",
      arguments: undefined,
    });

    expect(trackSpy).not.toHaveBeenCalled();
    expect(applySpy).not.toHaveBeenCalled();
  });

  it("QUICK_FIX_STABLE_ID_ERROR", () => {
    executeCommand(connection, {
      command: commands.QUICK_FIX_STABLE_ID_ERROR.name,
      arguments: [
        "fakeUri",
        "1",
        Range.create(Position.create(0, 0), Position.create(0, 10)),
        "new text",
      ],
    });
    expect(trackSpy).toHaveBeenCalledWith("MANIFEST_STABLE_ID", "single");
    expect(applySpy.mock.calls[0]).toMatchInlineSnapshot(`
          Array [
            Object {
              "documentChanges": Array [
                Object {
                  "edits": Array [
                    Object {
                      "newText": "new text",
                      "range": Object {
                        "end": Object {
                          "character": 10,
                          "line": 0,
                        },
                        "start": Object {
                          "character": 0,
                          "line": 0,
                        },
                      },
                    },
                  ],
                  "textDocument": Object {
                    "uri": "fakeUri",
                    "version": "1",
                  },
                },
              ],
            },
          ]
      `);
  });

  it("QUICK_FIX_STABLE_ID_FILE_ERRORS", () => {
    const issues: QuickFixStableIdInfo[] = [
      { newText: "newText_1", replaceRange: { start: 1, end: 10 } },
      { newText: "newText_2", replaceRange: { start: 11, end: 20 } },
    ];
    executeCommand(connection, {
      command: commands.QUICK_FIX_STABLE_ID_FILE_ERRORS.name,
      arguments: ["fakeUri", "2", issues],
    });

    expect(trackSpy).toHaveBeenCalledWith("MANIFEST_STABLE_ID", "multiple");
    expect(applySpy.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        Object {
          "documentChanges": Array [
            Object {
              "edits": Array [],
              "textDocument": Object {
                "uri": "2",
                "version": Array [
                  Object {
                    "newText": "newText_1",
                    "replaceRange": Object {
                      "end": 10,
                      "start": 1,
                    },
                  },
                  Object {
                    "newText": "newText_2",
                    "replaceRange": Object {
                      "end": 20,
                      "start": 11,
                    },
                  },
                ],
              },
            },
          ],
        },
      ]
    `);
  });

  it("unknown", () => {
    executeCommand(connection, {
      command: "dummy",
      arguments: [
        "fakeUri",
        "1",
        Range.create(Position.create(0, 0), Position.create(0, 10)),
        "new text",
      ],
    });

    expect(trackSpy).not.toHaveBeenCalled();
    expect(applySpy).not.toHaveBeenCalled();
  });
});
