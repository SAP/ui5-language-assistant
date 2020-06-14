import { find } from "lodash";
import { XMLAttribute } from "@xml-tools/ast";
import {
  UI5SemanticModel,
  UI5Prop,
  UI5Event,
  UI5Association,
} from "@ui5-language-assistant/semantic-model-types";
import {
  flattenEvents,
  getUI5ClassByXMLElement,
  flattenAssociations,
  flattenProperties,
} from "@ui5-language-assistant/logic-utils";
import { UseOfDeprecatedAttributeIssue } from "../../../api";
import {
  buildDeprecatedIssueMessage,
  DeprecatedUI5Symbol,
} from "../../utils/deprecated-message-builder";

export function validateUseOfDeprecatedAttribute(
  attribute: XMLAttribute,
  model: UI5SemanticModel
): UseOfDeprecatedAttributeIssue[] {
  if (attribute.syntax.key === undefined || attribute.key === null) {
    // Can't give an error without a position or value
    return [];
  }

  const ui5PropEventAssociation = findUI5PropEventAssociationByXMLAttributeKey(
    attribute,
    model
  );
  
  if (
    ui5PropEventAssociation === undefined ||
    ui5PropEventAssociation.deprecatedInfo === undefined
  ) {
    return [];
  }

  const deprecatedIssue: UseOfDeprecatedAttributeIssue = {
    kind: "UseOfDeprecatedAttribute",
    message: buildDeprecatedIssueMessage({
      symbol: ui5PropEventAssociation as DeprecatedUI5Symbol,
      model,
    }),
    severity: "warn",
    offsetRange: {
      start: attribute.syntax.key.startOffset,
      end: attribute.syntax.key.endOffset,
    },
  };

  return [deprecatedIssue];
}

function findUI5PropEventAssociationByXMLAttributeKey(
  attribute: XMLAttribute,
  model: UI5SemanticModel
): UI5Prop | UI5Event | UI5Association | undefined {
  const parentClass = getUI5ClassByXMLElement(attribute.parent, model);
  if (parentClass === undefined) {
    return undefined;
  }

  const allProps: (UI5Prop | UI5Event | UI5Association)[] = flattenProperties(
    parentClass
  );

  const allEvents = flattenEvents(parentClass);
  const allAssociations = flattenAssociations(parentClass);
  const allPropertiesEventsAssociations = allProps
    .concat(allEvents)
    .concat(allAssociations);

  return find(allPropertiesEventsAssociations, ["name", attribute.key]);
}
