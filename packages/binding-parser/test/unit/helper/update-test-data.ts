import { writeFile } from "fs/promises";
import { join, dirname } from "path";
import { parsePropertyBindingInfo } from "../../../src/api";
import {
  getAllNormalizeFolderPath,
  doesExits,
  transformCstForAssertion,
  serialize,
  getBase,
  getFileContent,
  transformParserErrorForAssertion,
} from ".";

const BASE = getBase();
export const update = async (): Promise<void | Error> => {
  const args = process.argv[2];
  const allInput = getAllNormalizeFolderPath(BASE).map((folder) =>
    join(BASE, folder, "input.txt")
  );
  const tests = args ? [join(BASE, args, "input.txt")] : allInput;
  for (const test of tests) {
    try {
      const ROOT = dirname(test);
      const text = await getFileContent(test);
      const positionExits = await doesExits(join(ROOT, "position.json"));
      let startPosition = undefined;
      if (positionExits) {
        const position = await getFileContent(join(ROOT, "position.json"));
        if (position !== undefined) {
          startPosition = JSON.parse(position);
        }
      }
      const { cst, ast, lexErrors, parseErrors } = parsePropertyBindingInfo(
        text,
        startPosition
      );
      transformCstForAssertion(cst);
      const errorTransform = transformParserErrorForAssertion(parseErrors);
      await writeFile(join(ROOT, "cst.json"), serialize(cst));
      await writeFile(join(ROOT, "ast.json"), serialize(ast));
      await writeFile(join(ROOT, "lexer-errors.json"), serialize(lexErrors));
      await writeFile(
        join(ROOT, "parse-errors.json"),
        serialize(errorTransform)
      );
    } catch (error) {
      throw Error(`Failed to update: ${test}`);
    }
  }
};
