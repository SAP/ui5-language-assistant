import { map, filter, includes, startsWith } from "lodash";
import { XMLElement } from "@xml-tools/ast";
import {
  UI5Cardinality,
  UI5Class,
  UI5Interface,
  UI5SemanticModel,
  UI5Type,
  UI5Aggregation,
} from "@ui5-language-assistant/semantic-model-types";
import {
  findClassesMatchingType,
  getUI5ClassByXMLElement,
  ui5NodeToFQN,
  getUI5AggregationByXMLElement,
} from "@ui5-language-assistant/logic-utils";
import { UI5ClassesInXMLTagNameCompletion } from "../../../api";
import { UI5ElementNameCompletionOptions } from "./index";

// These consts are meant to give meaningful names to the `null` value
// returned from logical flows in this file to make them easier to understand.
const UNRESOLVED_PREFIX_URI = null;
const NOT_FOUND = null;

export function classesSuggestions(
  opts: UI5ElementNameCompletionOptions
): UI5ClassesInXMLTagNameCompletion[] {
  const classSuggestionContext = computeClassSuggestionContext({
    xmlElement: opts.element,
    model: opts.context,
  });
  if (classSuggestionContext === NOT_FOUND) {
    return [];
  }

  // Avoid offering suggestion for an already "full" "0..1" aggregation
  if (
    classSuggestionContext.cardinality === "0..1" &&
    classSuggestionContext.parentXMLTag !== undefined &&
    classSuggestionContext.parentXMLTag.subElements.length > 1
  ) {
    return [];
  }

  const classesMatchingType = findClassesMatchingType({
    type: classSuggestionContext.allowedType,
    model: opts.context,
  });

  const prefixParts = getPrefixParts(opts.prefix, opts.element);
  if (prefixParts === UNRESOLVED_PREFIX_URI) {
    return [];
  }
  const classesMatchingPrefix = filter(classesMatchingType, (_) => {
    const classFqn = ui5NodeToFQN(_);
    const matchingNamespace = startsWith(classFqn, prefixParts.ns);
    const classFqnWithoutPrefix = classFqn.substring(prefixParts.ns.length);
    const matchingBasename = includes(classFqnWithoutPrefix, prefixParts.base);
    return matchingNamespace && matchingBasename;
  });

  const concreteClassesMatchingPrefix = filter(
    classesMatchingPrefix,
    (_) => !_.abstract
  );
  return map(concreteClassesMatchingPrefix, (_) => ({
    type: "UI5ClassesInXMLTagName",
    ui5Node: _,
    astNode: opts.element,
  }));
}

type classSuggestionContext = {
  allowedType: UI5Interface | UI5Class;
  cardinality: UI5Cardinality;
  parentXMLTag?: XMLElement;
};

function computeClassSuggestionContext({
  xmlElement,
  model,
}: {
  xmlElement: XMLElement;
  model: UI5SemanticModel;
}): classSuggestionContext | null {
  const parentXMLElement = xmlElement.parent;
  // top level class suggestions, it is kind of like an implicit aggregation
  if (parentXMLElement.type === "XMLDocument") {
    return {
      // TODO: in a fragment xml view an element may possibly be at the top level?
      allowedType: model.classes["sap.ui.core.Control"],
      cardinality: "0..1",
    };
  }

  // If the parent tag is a class this is an implicit (default) aggregation
  const parentUI5Class = getUI5ClassByXMLElement(parentXMLElement, model);
  if (parentUI5Class !== undefined) {
    return handleDefaultAggregationScenario({
      parentXMLElement,
      parentUI5Class,
    });
  }
  // If it's not a class, it could be an (explicit) aggregation
  const parentUI5Aggregation = getUI5AggregationByXMLElement(
    parentXMLElement,
    model
  );
  if (parentUI5Aggregation !== undefined) {
    return handleInsideExplicitAggregationScenario({
      parentXMLElement,
      parentUI5Aggregation,
    });
  }

  return NOT_FOUND;
}

function handleInsideExplicitAggregationScenario({
  parentXMLElement,
  parentUI5Aggregation,
}: {
  parentXMLElement: XMLElement;
  parentUI5Aggregation: UI5Aggregation;
}): classSuggestionContext | null {
  if (isClassOrInterfaceType(parentUI5Aggregation.type)) {
    return {
      allowedType: parentUI5Aggregation.type,
      cardinality: parentUI5Aggregation.cardinality,
      parentXMLTag: parentXMLElement,
    };
  } else {
    return NOT_FOUND;
  }
}

function handleDefaultAggregationScenario({
  parentXMLElement,
  parentUI5Class,
}: {
  parentXMLElement: XMLElement;
  parentUI5Class: UI5Class;
}): classSuggestionContext | null {
  const defaultAggregation = parentUI5Class.defaultAggregation;
  if (defaultAggregation === undefined) {
    return NOT_FOUND;
  }
  if (isClassOrInterfaceType(defaultAggregation.type)) {
    return {
      allowedType: defaultAggregation.type,
      cardinality: defaultAggregation.cardinality,
      parentXMLTag: parentXMLElement,
    };
  } else {
    return NOT_FOUND;
  }
}

function getPrefixParts(
  originalPrefix: string | undefined,
  xmlElement: XMLElement
): { ns: string; base: string } | null {
  if (originalPrefix === undefined) {
    return { ns: "", base: "" };
  }
  // TODO: align the `NAME` parts of the regExp to XML specs.
  //    `NAME` in XML allows just "\w+"
  const execResult = /^(?<prefix>\w+):(?<classBaseName>\w+)?$/.exec(
    originalPrefix
  ) as RegExpExecArray & { groups: { prefix: string; classBaseName: string } };

  if (execResult !== null) {
    const prefix = execResult.groups.prefix;
    const mappedURI = xmlElement.namespaces[prefix];
    const classBaseName = execResult.groups.classBaseName;
    if (mappedURI !== undefined) {
      return { ns: mappedURI, base: classBaseName ?? "" };
    }
    return UNRESOLVED_PREFIX_URI;
  } else {
    // We are intentionally not using the default xmlns for filtering purposes
    // as we wish to **offer everything** and if required do an "auto-import" and also update the xmlns section.
    return { ns: "", base: originalPrefix };
  }
}

function isClassOrInterfaceType(
  type: UI5Type | undefined
): type is UI5Class | UI5Interface {
  return includes(["UI5Class", "UI5Interface"], type?.kind);
}
