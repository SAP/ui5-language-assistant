import deepFreezeStrict from "deep-freeze-strict";
import { UI5ValidatorsConfig } from "../validate-xml-views";
import { validateUnknownEnumValue } from "./attributes/unknown-enum-value";
import { validateUnknownXmlnsNamespace } from "./attributes/unknown-xmlns-namespace";
import { validateBooleanValue } from "./attributes/invalid-boolean-value";
import { validateUseOfDeprecatedClass } from "./elements/use-of-deprecated-class";
import { validateUseOfDeprecatedAggregation } from "./elements/use-of-depracated-aggregation";
import { validateUseOfDeprecatedAttribute } from "./attributes/use-of-depracated-attribute";
import { validateUnknownAttributeKey } from "./attributes/unknown-attribute-key";
import { validateUnknownTagName } from "./elements/unknown-tag-name";
import { validateExplicitAggregationCardinality } from "./elements/cardinality-of-aggregation";
import { validateAggregationType } from "./elements/type-of-aggregation";

export { validateUnknownEnumValue } from "./attributes/unknown-enum-value";
export { validateUnknownXmlnsNamespace } from "./attributes/unknown-xmlns-namespace";
export { validateBooleanValue } from "./attributes/invalid-boolean-value";
export { validateUseOfDeprecatedClass } from "./elements/use-of-deprecated-class";
export { validateUseOfDeprecatedAggregation } from "./elements/use-of-depracated-aggregation";
export { validateUseOfDeprecatedAttribute } from "./attributes/use-of-depracated-attribute";
export { validateNonUniqueID } from "./document/non-unique-id";
export { validateUnknownAttributeKey } from "./attributes/unknown-attribute-key";
export { validateUnknownTagName } from "./elements/unknown-tag-name";
export { validateExplicitAggregationCardinality } from "./elements/cardinality-of-aggregation";
export { validateAggregationType } from "./elements/type-of-aggregation";
export { validateNonStableId } from "./elements/non-stable-id";

export const defaultValidators: UI5ValidatorsConfig = {
  document: [],
  element: [
    validateUseOfDeprecatedClass,
    validateUseOfDeprecatedAggregation,
    validateUnknownTagName,
    validateExplicitAggregationCardinality,
    validateAggregationType,
  ],
  attribute: [
    validateUnknownEnumValue,
    validateUnknownXmlnsNamespace,
    validateBooleanValue,
    validateUnknownAttributeKey,
    validateUseOfDeprecatedAttribute,
  ],
};

deepFreezeStrict(defaultValidators);
