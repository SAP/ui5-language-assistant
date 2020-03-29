import { resolve } from "path";
import * as Mocha from "mocha";
import * as glob from "glob";

export function run(): Promise<void> {
  const mocha = new Mocha({
    ui: "bdd",
    timeout: 20000
  });
  mocha.useColors(true);

  const testsRoot = resolve(__dirname);

  return new Promise((c, e) => {
    glob("**/**spec.js", { cwd: testsRoot }, (err, files) => {
      if (err) {
        return e(err);
      }

      files.forEach(f => mocha.addFile(resolve(testsRoot, f)));

      try {
        mocha.run(failures => {
          if (failures > 0) {
            e(new Error(`${failures} tests failed.`));
          } else {
            c();
          }
        });
      } catch (err) {
        console.error(err);
        e(err);
      }
    });
  });
}
