import { DefinitionParams, Range, Position } from "vscode-languageserver";
import * as controller from "../../src/controller";
import { getDefinition } from "../../src/api";
describe("api", () => {
  test("getDefinition", async () => {
    // arrange
    const parma = {} as DefinitionParams;
    const data: Position = { character: 0, line: 0 };
    const range: Range = { start: data, end: data };
    const returnData = [{ range, uri: "file-uri" }];
    const spyController = jest
      .spyOn(controller, "getControllerLocation")
      .mockResolvedValue(returnData);
    // act
    const result = await getDefinition(parma);
    // assert
    expect(result).toEqual(returnData);
    expect(spyController).toHaveBeenNthCalledWith(1, parma);
  });
});
