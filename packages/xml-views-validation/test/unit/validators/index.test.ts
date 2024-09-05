import klawSync from "klaw-sync";
import { map, filter, forEach, isFunction, includes } from "lodash";
import { resolve, relative } from "path";
import { UI5ValidatorsConfig } from "../../../src/validate-xml-views";

describe("The `allValidators` constant", () => {
  let validatorPaths: string[] = [];

  const validatorDir = resolve(__dirname, "../../../lib/src/validators");
  const klawItems = klawSync(validatorDir);
  const filePaths = map(klawItems, (_) => _.path);

  let defaultValidators;
  beforeAll(async () => {
    const apiModule = await import("../../../lib/src/" + "api"); // module name concatenation is done to avoid compiler complaint about missing module
    defaultValidators = apiModule.defaultValidators;
  });

  validatorPaths = filter(
    filePaths,
    (_) =>
      _.endsWith(".js") &&
      !_.endsWith("index.js") &&
      // "non-stable-id" validation is not part of allValidators.
      // We use it only when `flexEnabled` is set to true.
      !_.endsWith("non-stable-id.js") &&
      // non-unique-id validation is not part of allValidators. It is called explicity after all validation to collect non-unique ids cross all xml view files under webapp
      !_.endsWith("non-unique-id.js")
  );
  expect(validatorPaths).not.toBeEmpty();

  forEach(validatorPaths, (currValidatorPath) => {
    it(`contains a single validation from: ${relative(
      __dirname,
      currValidatorPath
    )}`, async () => {
      const validatorModule = await import(currValidatorPath);
      const validatorModuleFuncs = filter(validatorModule, isFunction);
      expect(validatorModuleFuncs).toHaveLength(1);

      forEach(validatorModuleFuncs, (currValidatorFunc) => {
        expect(defaultValidators).toSatisfy((_: UI5ValidatorsConfig) => {
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
