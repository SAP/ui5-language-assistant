//import { resolve } from "path";
//import { existsSync, mkdirSync, writeFileSync } from "fs";
import { map } from "lodash";
import fetch from "node-fetch";

import { UI5SemanticModel } from "@ui5-editor-tools/semantic-model-types";
import { generate, Json, TypeNameFix } from "@ui5-editor-tools/semantic-model";

const UI5_VERSION = "1.75.0"; //"1.71.14";

export async function getSemanticModel(): Promise<UI5SemanticModel> {
  const jsonMap: Record<string, Json> = {};
  const baseUrl =
    "https://sapui5.hana.ondemand.com/" + UI5_VERSION + "/test-resources/";
  const suffix = "/designtime/api.json";
  const libs = getLibs();

  //const libCacheDir = resolve(__dirname, "1.74.0");
  /*if (!existsSync(pathToDir)) {
      mkdirSync(libCacheDir);
    }*/

  await Promise.all(
    map(libs, async libName => {
      const response = await fetch(baseUrl + libName + suffix);
      const json = await response.json();
      //libName = libName.split("/").join(".") + ".api.json";
      //writeFileSync(resolve(libCacheDir, libName), JSON.stringify(json));
      jsonMap[libName] = json;
    })
  );

  return generate({
    libraries: jsonMap,
    typeNameFix: getTypeNameFix(),
    strict: false
  });
}

function getTypeNameFix(): TypeNameFix {
  const fixes: TypeNameFix = {
    "sap.m.PlanningCalendarHeader": undefined,
    "sap.m.TimePickerSlider": "sap.m.TimePickerSliders",
    "sap.ui.fl.write._internal.transport.TransportDialog": undefined,
    "sap.ui.layout.cssgrid.IGridItemLayoutData": undefined,
    "sap.ui.layout.ResponsiveSplitterPage": undefined,
    "Object.<string,any>": undefined
  };
  return fixes;
}

function getLibs(): string[] {
  return [
    "sap/m",
    "sap/f",
    "sap/tnt",
    "sap/ui/core",
    "sap/ui/codeeditor",
    "sap/ui/commons",
    "sap/ui/dt",
    "sap/ui/fl",
    "sap/ui/layout",
    "sap/ui/suite",
    "sap/ui/support",
    "sap/ui/unified",
    "sap/ui/table",
    "sap/ui/ux3"
  ];
}
