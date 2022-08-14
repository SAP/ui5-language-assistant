import { readdirSync } from "fs";
import { readJsonSync, readJson, existsSync } from "fs-extra";
import { resolve, dirname } from "path";
import { filter, reduce, has, forEach, remove, get, find } from "lodash";
import { FetchResponse } from "@ui5-language-assistant/language-server";
import { UI5Framework, UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { generateFunc, TestModelVersion, TypeNameFix, Json } from "../../api";
import { addUi5Resources } from "./download-ui5-resources";

const MODEL_CACHE: Record<TestModelVersion, UI5SemanticModel> = Object.create(
  null
);

const fixes: Record<TestModelVersion, TypeNameFix> = {
  "1.60.44": {
    "{sap.ui.layout.cssgrid.IGridConfigurable}": undefined,
    "sap.m.IHyphenation": undefined,
    "sap.ui.core.IDScope": undefined,
    "sap.m.TimePickerSlider": undefined,
    "sap.ui.layout.ResponsiveSplitterPage": undefined,
    "sap.ui.layout.cssgrid.CSSGridTrack": undefined,
    "sap.ui.layout.cssgrid.CSSGridGapShortHand": undefined,
    "sap.ui.layout.cssgrid.CSSGridLine": undefined,
    "sap.gantt.def.SvgDefs": undefined,
    "sap.gantt.simple.UtilizationChart": undefined,
    "sap.ui.suite.ui.commons.statusindicator.SimpleShape": undefined,
    "sap.ui.fl.transport.FlTransportDialog": undefined,
    "sap.ui.mdc.EditMode": undefined,
    "sap.ui.mdc.base.FieldHelpBase": undefined,
    "sap.ui.vk.TransformationMatrix": undefined,
    "sap.ui.base.BaseObject": undefined,
    "sap.ui.core.EventProvider": undefined,
    "sap.ui.vk.": "sap.ui.vk.Material",
    Service: undefined,

    Control: "sap.ui.core.Control",
    Element: "sap.ui.core.Element",
    array: "any[]",
    Array: "any[]",
    bloolean: "boolean",
    "sap.gantt.misc.AxisTime": "sap.gantt.misc.AxisTimes",
    "sap.gantt.control.Toolbar": undefined,
    "sap.gantt.DragOrientation": undefined,
    "sap.gantt.simple.GanttHeader": undefined,
    "sap.gantt.simple.InnerGanttChart": undefined,
    "sap.rules.ui.RuleBase": undefined,
    "sap.ui.generic.app.transaction.BaseController": undefined,
    "sap.ui.vk.tools.HitTestIdMode": undefined,
    "sap.ui.vk.tools.CoordinateSystem": undefined,
    "sap.ui.vk.SelectionMode": undefined,
    "sap.viz.ui5.controls.VizRangeSlider": undefined,
  },
  "1.71.49": {
    array: "any[]",
    Array: "any[]",
    "bloolean": undefined,
    Control: "sap.ui.core.Control",
    Element: "sap.ui.core.Element",
    "sap.fe.macros.MacroMetadata": undefined,
    "sap.gantt.misc.AxisTime": undefined,
    "sap.gantt.control.Toolbar": undefined,
    "sap.gantt.DragOrientation": undefined,
    "sap.gantt.simple.GanttHeader": undefined,
    "sap.gantt.simple.InnerGanttChart": undefined,
    "sap.m.PlanningCalendarHeader": undefined,
    "sap.m.TimePickerSlider": undefined,
    "sap.rules.ui.RuleBase": undefined,
    "sap.ui.generic.app.transaction.BaseController": undefined,
    "sap.ui.layout.ResponsiveSplitterPage": undefined,
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
    "sap.viz.ui5.controls.VizRangeSlider": undefined,
  },
  "1.84.27": {
    array: "any[]",
    Array: "any[]",
    Control: "sap.ui.core.Control",
    Element: "sap.ui.core.Element",
    "sap.ui.base.Element": "sap.ui.core.Element",
    "sap.fe.macros.MacroMetadata": undefined,
    "sap.fe.macros.NavigationType": undefined,
    "sap.gantt.control.Toolbar": undefined,
    "sap.gantt.simple.GanttHeader": undefined,
    "sap.gantt.simple.InnerGanttChart": undefined,
    "sap.m.PlanningCalendarHeader": undefined,
    "sap.m.TimePickerSlider": undefined,
    "sap.rules.ui.RuleBase": undefined,
    "sap.ui.core.mvc.XMLProcessingMode": undefined,
    "sap.ui.fl.write._internal.transport.TransportDialog": undefined,
    "sap.ui.generic.app.transaction.BaseController": undefined,
    "sap.ui.integration.designtime.editor.fields.BaseField": undefined,
    "sap.ui.layout.ResponsiveSplitterPage": undefined,
    "sap.ui.layout.cssgrid.IGridItemLayoutData": undefined,
    "sap.ui.mdc.DraftIndicatorType": undefined,
    "sap.ui.mdc.FilterBarP13nMode": undefined,
    "sap.ui.mdc.filterbar.FilterBarBase": undefined,
    "sap.ui.vk.IPlaybackCollection": undefined,
    "sap.ui.vk.ViewManager": undefined,
    "sap.viz.ui5.controls.VizRangeSlider": undefined,
    "QUnit.Assert": undefined,
  },
  "1.96.11": {
    array: "any[]",
    Array: "any[]",
    "object|string": "object",
    "boolean|string": "boolean",
    "Boolean": "boolean",
    "Promise": undefined,

    "function() : function": undefined,
    "function() : boolean": undefined,

    Element: "sap.ui.core.Element",
    "sap.fe.core.TemplateComponent": undefined,
    "sap.fe.macros.NavigationType": undefined,
    "sap.gantt.control.Toolbar": undefined,
    "sap.gantt.simple.GanttHeader": undefined,
    "sap.gantt.simple.InnerGanttChart": undefined,
    "sap.m.p13n.AbstractContainer": undefined,
    "sap.m.PlanningCalendarHeader": undefined,
    "sap.m.internal.ToggleSpinButton": undefined,
    "sap.m.TimePickerClock": undefined,
    "sap.m.TimePickerSlider": undefined,
    "sap.rules.ui.RuleBase": undefined,
    "sap.ui.core.mvc.XMLProcessingMode": undefined,
    "sap.ui.layout.ResponsiveSplitterPage": undefined,
    "sap.ui.mdc.IxState": undefined,
    "sap.ui.mdc.field.FieldValueHelpTableWrapperBase": undefined,
    "sap.ui.mdc.filterbar.IFilterContainer": undefined,
    "sap.ui.mdc.p13n.panels.BasePanel": undefined,
    "sap.ui.mdc.Table": undefined,
    "sap.ui.mdc.ui.Container": undefined,
    "sap.ui.vk.IncludeUsageIdType": undefined,
    "sap.ui.vk.RedlineComment": undefined,
    "sap.ui.vk.ViewManager": undefined,
    "sap.viz.ui5.controls.VizRangeSlider": undefined,
    "QUnit.Assert": undefined,
  },
  "1.105.0": {
    array: "any[]",
    Array: "any[]",
    "object|string": "object",
    "boolean|string": "boolean",
    "Promise": undefined,

    "function() : function": undefined,
    "function() : boolean": undefined,

    Element: "sap.ui.core.Element",

    "sap.f.cards.NumericIndicators": undefined,
    "sap.fe.core.TemplateComponent": undefined,
    "sap.fe.macros.MacroMetadata": undefined,
    "sap.fe.macros.NavigationType": undefined,
    "sap.fe.templates.ExtensionAPI": undefined,
    "sap.gantt.control.Toolbar": undefined,
    "sap.gantt.simple.GanttSearchSidePanel": undefined,
    "sap.gantt.simple.GanttHeader": undefined,
    "sap.gantt.simple.InnerGanttChart": undefined,
    "sap.m.PlanningCalendarHeader": undefined,
    "sap.m.internal.ToggleSpinButton": undefined,
    "sap.m.TimePickerClock": undefined,
    "sap.m.TimePickerSlider": undefined,
    "sap.rules.ui.RuleBase": undefined,
    "sap.sac.df.DFKernel": undefined,
    "sap.suite.ui.commons.FilePickerModes": undefined,
    "sap.ui.core.mvc.XMLProcessingMode": undefined,
    "Object<string,(string|function(sap.ui.core.Control) : string)>": "object",
    "sap.ui.integration.cards.filters.FilterBar": undefined,
    "sap.ui.layout.ResponsiveSplitterPage": undefined,
    "sap.ui.mdc.IxState": undefined,
    "sap.ui.mdc.chart.ChartToolbar": undefined,
    "sap.ui.mdc.field.FieldValueHelpTableWrapperBase": undefined,
    "sap.ui.mdc.filterbar.IFilterContainer": undefined,
    "sap.ui.mdc.TableType": undefined,
    "sap.ui.vk.RedlineComment": undefined,
    "sap.ui.vk.ToggleMenuItem": undefined,
    "sap.ui.vk.ViewManager": undefined,
    "sap.ushell.ui.tile.TileBase": undefined,
    "sap.viz.ui5.controls.VizRangeSlider": undefined,
    "QUnit.Assert": undefined,
  },
};

function getModelFolder(version: TestModelVersion): string {
  const pkgJsonPath = require.resolve(
    "@ui5-language-assistant/test-utils/package.json"
  );
  const rootPkgFolder = dirname(pkgJsonPath);
  const modelFolder = resolve(rootPkgFolder, ".model-cache", version);
  return modelFolder;
}

export function getTypeNameFixForVersion(
  version: TestModelVersion
): TypeNameFix {
  return fixes[version];
}

export async function readTestLibraryFile(
  version: string,
  fileName: string
): Promise<FetchResponse> {
  try {
    // version might not actually be a TestModelVersion but we'll return ok === false in that case
    // since the file won't exist
    const inputFolder = getModelFolder(version as TestModelVersion);
    const filePath = resolve(inputFolder, fileName);
    const ok = existsSync(filePath);
    return {
      ok: ok,
      status: 200,
      json: (): Promise<unknown> => readJson(filePath),
    };
  } catch (error) {
    return {
      ok: false,
      status: 404,
      json: (): never => {
        throw error;
      },
    };
  }
}

const downloadedLibrariesPromises: Record<string, Promise<void>> = {};

export async function downloadLibraries(
  version: TestModelVersion
): Promise<void> {
  if (!has(downloadedLibrariesPromises, version)) {
    downloadedLibrariesPromises[version] = addUi5Resources(
      version,
      getModelFolder(version)
    );
  }
  return downloadedLibrariesPromises[version];
}

// Load the library files from the file system.
// To save the libraries to the file system use downloadLibraries.
function loadLibraries(framework: UI5Framework, version: TestModelVersion): Record<string, Json> {
  const inputFolder = getModelFolder(version);
  const files = readdirSync(inputFolder);
  const LIBFILE_SUFFIX = ".designtime.api.json";
  const libFiles = filter(files, (_) => _.endsWith(LIBFILE_SUFFIX));
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

export async function generateModel({
  framework,
  version,
  downloadLibs = true,
  strict = true,
  modelGenerator,
}: {
  framework: UI5Framework;
  version: TestModelVersion;
  downloadLibs?: boolean;
  strict?: boolean;
  modelGenerator: generateFunc;
}): Promise<UI5SemanticModel> {
  // Don't cache the model if it's not created with the default options
  const useCache = strict === true;
  if (has(MODEL_CACHE, version) && useCache) {
    return MODEL_CACHE[version];
  }

  if (downloadLibs) {
    await downloadLibraries(version);
  }

  const libToFileContent = loadLibraries(framework, version);

  // If we want the libraries in strict mode we have to fix them first
  if (strict) {
    fixLibraries(version, libToFileContent);
  }

  const model = modelGenerator({
    framework: framework,
    version: version,
    libraries: libToFileContent,
    typeNameFix: getTypeNameFixForVersion(version),
    strict: strict,
    // If we're in strict mode we will want to see the validation errors
    printValidationErrors: strict,
  });
  if (useCache) {
    MODEL_CACHE[version] = model;
  }
  return model;
}

// Fix functions for model issues unfixable by schema changes
type LibraryFix = (content: Json) => void;

// Library version -> library name -> fix function
const libraryFixes: Record<TestModelVersion, Record<string, LibraryFix[]>> = {
  "1.60.44": {
    "sap.ushell": [
      (content: Json): void => {
        const symbol = find(
          get(content, "symbols"),
          (symbol) => symbol.name === "sap.ushell.services.EndUserFeedback"
        );
        const method = find(
          get(symbol, "methods"),
          (method) => method.name === "getLegalText"
        );
        remove(method.parameters, (parameter) => get(parameter, "name") === "");
      },
    ],
  },
  "1.71.49": {},
  "1.84.27": {},
  "1.96.11": {
    "sap.ui.mdc": [
      (content: Json): void => {
        forEach(get(content, "symbols"), (symbol) => {
          const defaultAggregation = symbol?.["ui5-metadata"]?.defaultAggregation;
          if (defaultAggregation && !symbol["ui5-metadata"].aggregations?.[defaultAggregation]) {
            symbol["ui5-metadata"].aggregations = symbol["ui5-metadata"].aggregations || [];
            symbol["ui5-metadata"].aggregations.push(                    {
              "name": "content",
              "singularName": "content",
              "type": "sap.ui.core.Control",
              "cardinality": "0..1",
              "visibility": "public",
              "methods": [
                  "getContent",
                  "destroyContent",
                  "setContent"
              ]
            });
          }
        });
      },
    ],
  },
  "1.105.0": {
    "sap.ui.mdc": [
      (content: Json): void => {
        forEach(get(content, "symbols"), (symbol) => {
          const defaultAggregation = symbol?.["ui5-metadata"]?.defaultAggregation;
          if (defaultAggregation && !symbol["ui5-metadata"].aggregations?.[defaultAggregation]) {
            symbol["ui5-metadata"].aggregations = symbol["ui5-metadata"].aggregations || [];
            symbol["ui5-metadata"].aggregations.push(                    {
              "name": "content",
              "singularName": "content",
              "type": "sap.ui.core.Control",
              "cardinality": "0..1",
              "visibility": "public",
              "methods": [
                  "getContent",
                  "destroyContent",
                  "setContent"
              ]
            });
          }
        });
      },
    ],
  },
};

function fixLibraries(
  version: TestModelVersion,
  libToFileContent: Record<string, Json>
): void {
  const fixesForLib = libraryFixes[version];
  forEach(fixesForLib, (fixes, library) => {
    if (has(libToFileContent, library)) {
      forEach(fixes, (fix) => fix(libToFileContent[library]));
    }
  });
}
