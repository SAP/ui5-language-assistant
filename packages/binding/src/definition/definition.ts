import { AGGREGATION_BINDING_INFO, PROPERTY_BINDING_INFO } from "../api";
import { BindContext, BindingInfoElement, PropertyType } from "../types";
import { buildType, getAltTypesPrime, getDocumentation } from "../utils";
import { getFallBackElements } from "./fall-back-definition";
import type {
  UI5Aggregation,
  UI5TypedefProp,
} from "@ui5-language-assistant/semantic-model-types";

const removeDuplicate = (builtType: PropertyType[]): PropertyType[] => {
  const result = builtType.reduce(
    (previous: PropertyType[], current: PropertyType) => {
      const index = previous.findIndex((i) => i.kind === current.kind);
      if (index === -1) {
        return [...previous, current];
      }
      // there is duplicate
      /* istanbul ignore next */
      if (current.possibleValue?.values.length !== 0) {
        // has possible value, remove previous - keep current
        return [...previous.slice(index), current];
      }
      /* istanbul ignore next */
      if (previous[index].possibleValue?.values.length !== 0) {
        // has possible value - keep it
        return previous;
      }
      return [...previous, current];
    },
    []
  );
  return result;
};

const processUI5TypedefProperties = (param: {
  properties: UI5TypedefProp[];
  context: BindContext;
  aggregation?: UI5Aggregation;
  forHover?: boolean;
}) => {
  const { properties, forHover = false, aggregation, context } = param;
  const elements: BindingInfoElement[] = [];
  for (const property of properties) {
    const { name, type } = property;
    if (!type) {
      /* istanbul ignore next */
      continue;
    }
    let builtType = buildType({
      context,
      type,
      name,
      collection: false,
      ui5Aggregation: aggregation,
      forHover,
    });
    builtType = removeDuplicate(builtType);
    const FQN = aggregation ? AGGREGATION_BINDING_INFO : PROPERTY_BINDING_INFO;
    const data: BindingInfoElement = {
      name: name,
      type: builtType,
      documentation: getDocumentation({
        context,
        prop: property,
        FQN,
        forHover,
      }),
    };
    if (property.optional === false) {
      data.required = true;
    }
    elements.push(data);
  }
  return elements;
};

export const getBindingElements = (
  context: BindContext,
  /* istanbul ignore next */
  aggregation: UI5Aggregation | undefined = undefined,
  /* istanbul ignore next */
  forHover = false
): BindingInfoElement[] => {
  const elements: BindingInfoElement[] = [];
  const propBinding = aggregation
    ? context.ui5Model.typedefs[AGGREGATION_BINDING_INFO]
    : context.ui5Model.typedefs[PROPERTY_BINDING_INFO];

  if (!propBinding) {
    return getFallBackElements(!!aggregation);
  }
  elements.push(
    ...processUI5TypedefProperties({
      context,
      forHover,
      aggregation,
      properties: propBinding.properties,
    })
  );
  const altTypes = getAltTypesPrime(aggregation);
  if (altTypes) {
    // if `altTypes`, add `PROPERTY_BINDING_INFO` properties too
    elements.push(
      ...processUI5TypedefProperties({
        properties: context.ui5Model.typedefs[PROPERTY_BINDING_INFO].properties,
        context,
        forHover,
      })
    );
  }

  return elements;
};
