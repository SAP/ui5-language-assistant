import { map, filter, includes } from "lodash";
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
  splitQNameByNamespace,
  resolveXMLNSFromPrefix,
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
    if (prefixParts.ns !== "") {
      // If the prefix has a namespace (looks like <ns>:<name>),
      // the namespace part should be matched exactly (only classes from this namespace
      // should be returned) and the name part should be included in the class base name.
      // For example, "mvc:View" prefix (where xmlns:mvc="sap.ui.core.mvc")
      // should match "sap.ui.core.mvc.View" and "sap.ui.core.mvc.HTMLView" classes
      // and should not match any class from other namespaces (e.g. "sap.ui.core.mvc.subns.View").
      return (
        _.parent !== undefined &&
        ui5NodeToFQN(_.parent) === prefixParts.ns &&
        includes(_.name, prefixParts.base)
      );
    } else {
      // If there is no namespace in the prefix, the prefix should be included in the
      // class fully qualified name.
      // For example, "mvc.View" prefix should match "sap.ui.core.mvc.View" class.
      return includes(ui5NodeToFQN(_), prefixParts.base);
    }
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
  let defaultAggregation: UI5Aggregation | undefined = undefined;

  // handle inheritance
  let currentClass: UI5Class | undefined = parentUI5Class;
  while (currentClass) {
    if (currentClass.defaultAggregation === undefined) {
      currentClass = currentClass.extends;
    } else {
      defaultAggregation = currentClass.defaultAggregation;
      break;
    }
  }

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
  const { prefix, localName } = splitQNameByNamespace(originalPrefix ?? "");
  let resolvedNS: string | undefined = "";
  // If there is no namespace prefix, don't fall back to the default namespace because
  // we don't want to filter according to it (we will return classes from all namespaces if
  // a namespace prefix is not defined)
  if (prefix !== undefined) {
    resolvedNS = resolveXMLNSFromPrefix(prefix, xmlElement);
    if (resolvedNS === undefined) {
      return UNRESOLVED_PREFIX_URI;
    }
  }
  return { ns: resolvedNS, base: localName };
}

function isClassOrInterfaceType(
  type: UI5Type | undefined
): type is UI5Class | UI5Interface {
  return includes(["UI5Class", "UI5Interface"], type?.kind);
}
