import { UI5TypedefProp } from "@ui5-language-assistant/semantic-model-types";
import { PROPERTY_BINDING_INFO } from "../constant";
import {
  BindContext,
  PropertyBindingInfoElement,
  BindingInfoName,
  PropertyType,
  TypeKind,
} from "../types";
const buildType = (property: UI5TypedefProp): PropertyType[] => {
  const types: PropertyType[] = [];
  const { name, type } = property;
  switch (name) {
    case BindingInfoName.parameters:
    case BindingInfoName.events:
    case BindingInfoName.model:
    case BindingInfoName.formatter:
    case BindingInfoName.targetType: {
      types.push({
        kind: type === "function" ? TypeKind.string : type,
        dependents: [],
        notAllowedElements: [],
      });
      break;
    }
    case BindingInfoName.path:
      types.push({
        kind: type,
        dependents: [],
        notAllowedElements: [BindingInfoName.parts, BindingInfoName.value],
      });
      break;
    case BindingInfoName.value: {
      types.push({
        kind: type,
        dependents: [],
        notAllowedElements: [BindingInfoName.parts, BindingInfoName.path],
      });
      break;
    }
    case BindingInfoName.parts: {
      types.push({
        kind: TypeKind.object,
        dependents: [],
        notAllowedElements: [BindingInfoName.value, BindingInfoName.path],
        collection: true,
      });
      types.push({
        kind: TypeKind.string,
        dependents: [],
        notAllowedElements: [],
        collection: true,
      });
      break;
    }
    case BindingInfoName.suspended:
    case BindingInfoName.useRawValues:
    case BindingInfoName.useInternalValues: {
      types.push({
        kind: type,
        dependents: [],
        notAllowedElements: [],
        default: {
          values: [true, false],
          fixed: true,
        },
      });
      break;
    }
    case BindingInfoName.mode: {
      types.push({
        kind: TypeKind.string,
        dependents: [],
        notAllowedElements: [],
        default: {
          values: [
            "sap.ui.model.BindingMode.Default",
            "sap.ui.model.BindingMode.OneTime",
            "sap.ui.model.BindingMode.OneWay",
            "sap.ui.model.BindingMode.TwoWay",
          ],
          fixed: true,
        },
      });
      break;
    }
    case BindingInfoName.type: {
      types.push({
        kind: TypeKind.string,
        dependents: [],
        notAllowedElements: [],
        default: {
          values: [
            "sap.ui.model.type.Boolean",
            "sap.ui.model.type.Currency",
            "sap.ui.model.type.Date",
            "sap.ui.model.type.DateInterval",
            "sap.ui.model.type.DateTime",
            "sap.ui.model.type.DateTimeInterval",
            "sap.ui.model.type.FileSize",
            "sap.ui.model.type.Float",
            "sap.ui.model.type.Integer",
            "sap.ui.model.type.String",
            "sap.ui.model.type.Time",
            "sap.ui.model.type.TimeInterval",
            "sap.ui.model.type.Unit",
          ],
          fixed: false, // can also have custom type - implemented by user
        },
      });

      break;
    }
    case BindingInfoName.constraints:
    case BindingInfoName.formatOptions: {
      types.push({
        kind: type,
        dependents: [
          {
            name: BindingInfoName.type,
            type: [
              {
                kind: TypeKind.string,
                dependents: [],
                notAllowedElements: [],
              },
            ],
          },
        ],
        notAllowedElements: [],
      });
      break;
    }
    default:
      break;
  }
  return types;
};

const isBindingInfoName = (name: string): name is BindingInfoName => {
  return !!BindingInfoName[name];
};

export const getPropertyBindingInfoElements = (
  context: BindContext
): PropertyBindingInfoElement[] => {
  const propBinding = context.ui5Model.typedefs[PROPERTY_BINDING_INFO];
  const elements: PropertyBindingInfoElement[] = [];
  const properties = propBinding.properties;
  for (const property of properties) {
    const { description, name, type, visibility, optional } = property;
    if (!isBindingInfoName(name)) {
      continue;
    }
    elements.push({
      name: name,
      type: buildType(property),
      documentation: {
        description,
        type,
        visibility,
        optional,
      },
    });
  }
  return elements;
};
