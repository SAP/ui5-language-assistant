import { find, map, filter, includes, startsWith } from "lodash";
import { InvalidSyntax, XMLElement } from "@xml-tools/ast";
import {
  UI5Cardinality,
  UI5Class,
  UI5Interface,
  UI5SemanticModel,
  UI5Type
} from "@ui5-editor-tools/semantic-model-types";
import {
  findClassesMatchingType,
  flattenAggregations,
  ui5NodeToFQN
} from "@ui5-editor-tools/logic-utils";
import { UI5ClassesInXMLTagNameCompletion } from "../../../api";
import { getClassByElement } from "../utils/filter-members";
import { UI5ElementNameCompletionOptions } from "./index";

// TODO: expose this const from XML-Tools?
const invalidSyntax: InvalidSyntax = null;
// These consts are meant to give meaningful names to the `null` value
// returned from logical flows in this file to make them easier to understand.
const UNRESOLVED_PREFIX_URI = null;
const NOT_FOUND = null;
const startsWithLowerCase = /^[a-z]/;
const startsWithUpperCase = /^[A-Z]/;

export function classesSuggestions(
  opts: UI5ElementNameCompletionOptions
): UI5ClassesInXMLTagNameCompletion[] {
  const classSuggestionContext = computeClassSuggestionContext({
    xmlElement: opts.element,
    model: opts.context
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
    model: opts.context
  });

  const prefixParts = getPrefixParts(opts.prefix, opts.element);
  if (prefixParts === UNRESOLVED_PREFIX_URI) {
    return [];
  }
  const classesMatchingPrefix = filter(classesMatchingType, _ => {
    const classFqn = ui5NodeToFQN(_);
    const matchingNamespace = startsWith(classFqn, prefixParts.ns);
    const classFqnWithoutPrefix = classFqn.substring(prefixParts.ns.length);
    // TODO: should we add more contraints here and check "includes" on baseName of FQN only?
    //   - But if we do that we may not be consistent with how we behave when no XMLNS is provided...
    //   - Perhaps this whole flow of suggesting things that are not accessiable (no relevant xmlns defined) should
    //   - instead be handled by auto-importing / defining said namespaces/prefixes.
    const matchingBasename = includes(classFqnWithoutPrefix, prefixParts.base);

    return matchingNamespace && matchingBasename;
  });

  return map(classesMatchingPrefix, _ => ({
    type: "UI5ClassesInXMLTagName",
    ui5Node: _,
    astNode: opts.element
  }));
}

type classSuggestionContext = {
  allowedType: UI5Interface | UI5Class;
  cardinality: UI5Cardinality;
  parentXMLTag?: XMLElement;
};

function computeClassSuggestionContext({
  xmlElement,
  model
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
      cardinality: "0..1"
    };
  }

  const parentXMLElementName = parentXMLElement.name;
  if (parentXMLElementName !== invalidSyntax) {
    // possible class inside aggregation scenario
    const grandParentXMLElement = parentXMLElement.parent;
    if (
      startsWithLowerCase.test(parentXMLElementName) &&
      grandParentXMLElement.type !== "XMLDocument"
    ) {
      return handleInsideExplicitAggregationScenario({
        grandParentXMLElement,
        parentXMLElement,
        model
      });
    } else if (startsWithUpperCase.test(parentXMLElementName)) {
      return handleDefaultAggregationScenario({ parentXMLElement, model });
    }
    // unrecognized scenario
    else {
      return NOT_FOUND;
    }
  }

  return NOT_FOUND;
}

function handleInsideExplicitAggregationScenario({
  grandParentXMLElement,
  parentXMLElement,
  model
}: {
  grandParentXMLElement: XMLElement;
  parentXMLElement: XMLElement;
  model: UI5SemanticModel;
}): classSuggestionContext | null {
  const grandParentUI5Class = getClassByElement(grandParentXMLElement, model);
  if (grandParentUI5Class === undefined) {
    return NOT_FOUND;
  }
  const allGrandParentAggregations = flattenAggregations(grandParentUI5Class);
  const parentUI5Aggregation = find(allGrandParentAggregations, [
    "name",
    parentXMLElement.name
  ]);
  if (parentUI5Aggregation === undefined) {
    return NOT_FOUND;
  }
  if (isClassOrInterfaceType(parentUI5Aggregation.type)) {
    return {
      allowedType: parentUI5Aggregation.type,
      cardinality: parentUI5Aggregation.cardinality,
      parentXMLTag: parentXMLElement
    };
  } else {
    return NOT_FOUND;
  }
}

function handleDefaultAggregationScenario({
  parentXMLElement,
  model
}: {
  parentXMLElement: XMLElement;
  model: UI5SemanticModel;
}): classSuggestionContext | null {
  const parentUI5Class = getClassByElement(parentXMLElement, model);
  if (parentUI5Class === undefined) {
    return NOT_FOUND;
  }
  const defaultAggregation = parentUI5Class.defaultAggregation;
  if (defaultAggregation === undefined) {
    return NOT_FOUND;
  }
  if (isClassOrInterfaceType(defaultAggregation.type)) {
    return {
      allowedType: defaultAggregation.type,
      cardinality: defaultAggregation.cardinality,
      parentXMLTag: parentXMLElement
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
