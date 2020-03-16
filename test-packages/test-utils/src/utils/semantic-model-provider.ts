import {
  generate,
  TypeNameFix,
  Json
} from "@ui5-language-assistant/semantic-model";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { TestModelVersion } from "../../api";
import { readdirSync } from "fs";
import { readJsonSync } from "fs-extra";
import { resolve, dirname } from "path";
import { filter, reduce, has } from "lodash";

const MODEL_CACHE: Record<TestModelVersion, UI5SemanticModel> = Object.create(
  null
);

const fixes: Record<TestModelVersion, TypeNameFix> = {
  "1.60.14": {
    "{sap.ui.layout.cssgrid.IGridConfigurable}": undefined,
    "sap.m.IHyphenation": undefined,
    "sap.ui.core.IDScope": undefined,
    "sap.m.TimePickerSlider": undefined,
    "sap.ui.layout.ResponsiveSplitterPage": undefined,
    "sap.ui.layout.cssgrid.CSSGridTrack": undefined,
    "sap.ui.layout.cssgrid.CSSGridGapShortHand": undefined,
    "sap.ui.layout.cssgrid.CSSGridLine": undefined
  },
  "1.74.0": {
    "sap.m.PlanningCalendarHeader": undefined,
    "sap.m.TimePickerSlider": undefined,
    "sap.ui.fl.write._internal.transport.TransportDialog": undefined,
    "sap.ui.layout.cssgrid.IGridItemLayoutData": undefined,
    "sap.ui.layout.ResponsiveSplitterPage": undefined
  },
  "1.75.0": {
    "sap.m.PlanningCalendarHeader": undefined,
    "sap.m.TimePickerSlider": "sap.m.TimePickerSliders",
    "sap.ui.fl.write._internal.transport.TransportDialog": undefined,
    "sap.ui.layout.cssgrid.IGridItemLayoutData": undefined,
    "sap.ui.layout.ResponsiveSplitterPage": undefined,
    "Object.<string,any>": undefined
  },
  "1.71.14": {
    Control: "sap.ui.core.Control",
    Element: "sap.ui.core.Element",
    array: "any[]",
    Array: "any[]",
    bloolean: "boolean",
    "sap.m.PlanningCalendarHeader": undefined,
    "sap.m.TimePickerSlider": undefined,
    "sap.ui.layout.ResponsiveSplitterPage": undefined,
    "sap.gantt.misc.AxisTime": "sap.gantt.misc.AxisTimes",
    "sap.gantt.control.Toolbar": undefined,
    "sap.gantt.DragOrientation": undefined,
    "sap.gantt.simple.GanttHeader": undefined,
    "sap.gantt.simple.InnerGanttChart": undefined,
    "sap.rules.ui.RuleBase": undefined,
    "sap.ui.generic.app.transaction.BaseController": undefined,
    "sap.ui.vk.BillboardTextEncoding": undefined,
    "sap.ui.vk.BillboardStyle": undefined,
    "sap.ui.vk.BillboardBorderLineStyle": undefined,
    "sap.ui.vk.BillboardHorizontalAlignment": undefined,
    "sap.ui.vk.BillboardCoordinateSpace": undefined,
    "sap.ui.vk.DetailViewType": undefined,
    "sap.ui.vk.DetailViewShape": undefined,
    "sap.ui.vk.tools.HitTestIdMode": undefined,
    "sap.ui.vk.tools.CoordinateSystem": undefined,
    "sap.ui.vk.AnimationTimeSlider": undefined,
    "sap.ui.vk.SelectionMode": undefined,
    "sap.ui.vk.RenderMode": undefined,
    "sap.viz.ui5.controls.VizRangeSlider": undefined
  }
};

function getModelFolder(version: TestModelVersion): string {
  const pkgJsonPath = require.resolve(
    "@ui5-language-assistant/test-utils/package.json"
  );
  const rootPkgFolder = dirname(pkgJsonPath);
  const modelFolder = resolve(
    rootPkgFolder,
    "resources",
    "model",
    version,
    "input"
  );
  return modelFolder;
}

export function getTypeNameFixForVersion(
  version: TestModelVersion
): TypeNameFix {
  return fixes[version];
}

export function loadLibraries(version: TestModelVersion): Record<string, Json> {
  const inputFolder = getModelFolder(version);
  const files = readdirSync(inputFolder);
  const LIBFILE_SUFFIX = ".designtime.api.json";
  const libFiles = filter(files, _ => _.endsWith(LIBFILE_SUFFIX));
  const libToFileContent = reduce(
    libFiles,
    (libToFileContentMap, file) => {
      const libName = file.substring(0, file.length - LIBFILE_SUFFIX.length);
      libToFileContentMap[libName] = readJsonSync(resolve(inputFolder, file));
      return libToFileContentMap;
    },
    Object.create(null)
  );
  return libToFileContent;
}

export function generateModel(
  version: TestModelVersion,
  disableCache = false
): UI5SemanticModel {
  if (has(MODEL_CACHE, version) && !disableCache) {
    return MODEL_CACHE[version];
  }

  const libToFileContent = loadLibraries(version);
  const model = generate({
    libraries: libToFileContent,
    typeNameFix: getTypeNameFixForVersion(version)
  });
  if (!disableCache) {
    MODEL_CACHE[version] = model;
  }
  return model;
}
