/* Based on https://github.com/microsoft/vscode-extension-samples/blob/master/lsp-sample/client/src/test/index.ts */
import { resolve } from "path";
import * as Mocha from "mocha";
import * as glob from "glob";
import "source-map-support/register";

export function run(): Promise<void> {
  const mocha = new Mocha({
    ui: "bdd",
    timeout: 20000,
  });
  mocha.useColors(true);

  const testsRoot = resolve(__dirname);

  return new Promise((resolvePromise, rejectPromise) => {
    glob("**/*spec.js", { cwd: testsRoot }, (err, files) => {
      if (err) {
        return rejectPromise(err);
      }

      files.forEach((f) => mocha.addFile(resolve(testsRoot, f)));

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
}
