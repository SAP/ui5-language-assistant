import * as klawSync from "klaw-sync";
import { map, filter, forEach, isFunction, includes } from "lodash";
import { resolve, relative } from "path";
import { expect } from "chai";
import { allValidators } from "../../src/validators";
import { UI5Validators } from "../../src/validate-xml-views";

describe("The `allValidators` constant", () => {
  let validatorPaths: string[] = [];

  const validatorDir = resolve(__dirname, "../../src/validators");
  const klawItems = klawSync(validatorDir);
  const filePaths = map(klawItems, (_) => _.path);
  validatorPaths = filter(
    filePaths,
    (_) => _.endsWith(".js") && !_.endsWith("index.js")
  );
  expect(validatorPaths).to.not.be.empty;

  forEach(validatorPaths, (currValidatorPath) => {
    it(`contains a single validation from: ${relative(
      __dirname,
      currValidatorPath
    )}`, async () => {
      const validatorModule = await import(currValidatorPath);
      const validatorModuleFuncs = filter(validatorModule, isFunction);
      expect(
        validatorModuleFuncs,
        "A Validator module should only export a single function"
      ).to.have.lengthOf(1);

      forEach(validatorModuleFuncs, (currValidatorFunc) => {
        expect(allValidators).to.satisfy((_: UI5Validators) => {
          return (
            includes(_.element, currValidatorFunc) ||
            includes(_.attribute, currValidatorFunc) ||
            includes(_.document, currValidatorFunc)
          );
        });
      });
    });
  });
});
