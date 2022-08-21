/* Based on https://github.com/microsoft/vscode-extension-samples/blob/master/lsp-sample/client/src/test/index.ts */
import { resolve } from "path";
import Mocha from "mocha";
import glob from "glob";
import "source-map-support/register";

export function createIndexRun(scenarioRoot: string): () => Promise<void> {
  return async function run() {
    const mocha = new Mocha({
      ui: "bdd",
      timeout: 20000,
    });

    const scenarioRootAbs = resolve(scenarioRoot);

    return new Promise((resolvePromise, rejectPromise) => {
      glob("**/*spec.js", { cwd: scenarioRootAbs }, (err, files) => {
        if (err) {
          return rejectPromise(err);
        }

        files.forEach((f) => mocha.addFile(resolve(scenarioRootAbs, f)));

        try {
          mocha.run((failures) => {
            if (failures > 0) {
              rejectPromise(new Error(`${failures} tests failed.`));
            } else {
              resolvePromise();
            }
          });
        } catch (err) {
          console.error(err);
          rejectPromise(err);
        }
      });
    });
  };
}
