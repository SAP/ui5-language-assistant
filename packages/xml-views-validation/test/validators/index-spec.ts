import klawSync from "klaw-sync";
import { map, filter, forEach, isFunction, includes } from "lodash";
import { resolve, relative } from "path";
import { expect } from "chai";
import { defaultValidators } from "../../src/api";
import { UI5ValidatorsConfig } from "../../src/validate-xml-views";

describe("The `allValidators` constant", () => {
  let validatorPaths: string[] = [];

  const validatorDir = resolve(__dirname, "../../src/validators");
  const klawItems = klawSync(validatorDir);
  const filePaths = map(klawItems, (_) => _.path);
  validatorPaths = filter(
    filePaths,
    (_) =>
      _.endsWith(".js") &&
      !_.endsWith("index.js") &&
      // "non-stable-id" validation is not part of allValidators.
      // We use it only when `flexEnabled` is set to true.
      !_.endsWith("non-stable-id.js")
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
        expect(defaultValidators).to.satisfy((_: UI5ValidatorsConfig) => {
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
