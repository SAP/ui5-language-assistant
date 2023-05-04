import { expect } from "chai";
import { parsePropertyBindingInfo } from "../../src/parser";
import {
  getInput,
  getCst,
  getAst,
  getLexerErrors,
  getParserErrors,
  getAllNormalizeFolderPath,
  transformCstForAssertion,
  doesExits,
  getBase,
  transformParserErrorForAssertion,
  deserialize,
  serialize,
} from "../utils";
import type { Position } from "vscode-languageserver-types";
import { join } from "path";
import { readFileSync } from "fs";

const testParser = async (testCasePath: string): Promise<void> => {
  const text = await getInput(testCasePath);
  let startPosition: Position | undefined;
  const base = getBase();
  const positionExits = await doesExits(
    join(base, testCasePath, "position.json")
  );
  if (positionExits) {
    const position = readFileSync(
      join(base, testCasePath, "position.json")
    ).toString();
    if (position !== undefined) {
      startPosition = JSON.parse(position);
    }
  }
  const { cst, lexErrors, parseErrors, ast } = parsePropertyBindingInfo(
    text,
    startPosition
  );
  const lexerSavedContent = await getLexerErrors(testCasePath);
  expect(lexErrors).to.deep.equal(lexerSavedContent);

  const errorTransform = transformParserErrorForAssertion(parseErrors);
  const parseSavedContent = await getParserErrors(testCasePath);
  expect(errorTransform).to.deep.equal(parseSavedContent);

  transformCstForAssertion(cst);
  const cstSavedContent = await getCst(testCasePath);
  expect(deserialize(serialize(cst))).to.deep.equal(cstSavedContent);
  const astSavedContent = await getAst(testCasePath);
  expect(deserialize(serialize(ast))).to.deep.equal(astSavedContent);
};
describe("property binding info parser", () => {
  const allTests = getAllNormalizeFolderPath();
  /**
   * Include folder name e.g '/key-colon-value' to skip it
   */
  const skip: string[] = [];
  // const todo: string[] = [];
  /**
   * Include folder name e.g '/key-only' to only execute it
   */
  const only: string[] = [];
  for (const t of allTests) {
    if (skip.includes(t)) {
      it.skip(`${t}`, () => {
        expect(false).to.be.true;
      });
      continue;
    }
    // if (todo.includes(t)) {
    //     it.todo(`${t}`);
    //     continue;
    // }
    if (only.includes(t)) {
      it.only(`${t}`, async () => {
        await testParser(t);
      });
      continue;
    }
    it(`${t}`, async () => {
      await testParser(t);
    });
  }
});
