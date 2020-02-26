import { UI5SemanticModel } from "@vscode-ui5/semantic-model-types";
import { TypeNameFix } from "../api";
import { generate } from "../src/api";
import { expect } from "chai";
import { resolve, dirname } from "path";
import { readdirSync } from "fs";
import { readJsonSync } from "fs-extra";
import { filter, map, assign } from "lodash";

function generateFromFolder(
  inputFolder: string,
  fqnFix: TypeNameFix
): UI5SemanticModel {
  const files = readdirSync(inputFolder);
  const LIBFILE_SUFFIX = ".designtime.api.json";
  const libFiles = filter(files, _ => _.endsWith(LIBFILE_SUFFIX));
  const libToFileContent = assign(
    Object.create(null),
    ...map(libFiles, file => ({
      [file.substring(0, file.length - LIBFILE_SUFFIX.length)]: readJsonSync(
        resolve(inputFolder, file)
      )
    }))
  );
  return generate({ libraries: libToFileContent, typeNameFix: fqnFix });
}

// Avoid relative paths which would differ between src(ts) and lib(js) folders.
const pkgJsonPath = require.resolve("@vscode-ui5/semantic-model/package.json");
const rootPkgFolder = dirname(pkgJsonPath);
const apiJsonFolder = resolve(rootPkgFolder, "test");

describe("The ui5-vscode semantic model package", () => {
  it("Generate from 1.60.14", () => {
    const model = generateFromFolder(
      resolve(apiJsonFolder, "1.60.14", "input"),
      {
        "{sap.ui.layout.cssgrid.IGridConfigurable}":
          "sap.ui.layout.cssgrid.IGridConfigurable",
        "sap.m.IHyphenation": undefined,
        "sap.ui.core.IDScope": undefined,
        "sap.m.TimePickerSlider": "sap.m.TimePickerSliders",
        "sap.ui.layout.ResponsiveSplitterPage": undefined,
        Object: undefined,
        String: "string",
        undefined: undefined
      }
    );
    expect(model).to.exist;
  });

  it("Generate from 1.74.0", () => {
    const model = generateFromFolder(
      resolve(apiJsonFolder, "1.74.0", "input"),
      {
        "sap.m.PlanningCalendarHeader": undefined,
        "sap.m.TimePickerSlider": "sap.m.TimePickerSliders",
        "sap.ui.fl.write._internal.transport.TransportDialog": undefined,
        "sap.ui.layout.cssgrid.IGridItemLayoutData": undefined,
        "sap.ui.layout.ResponsiveSplitterPage": undefined,
        Object: undefined,
        map: undefined,
        function: undefined,
        String: "string",
        undefined: undefined
      }
    );
    expect(model).to.exist;
  });

  // CDN libraries (example URL):
  // https://sapui5-sapui5.dispatcher.us1.hana.ondemand.com/test-resources/sap/m/designtime/api.json
});
