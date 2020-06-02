import { UI5Validators } from "../validate-xml-views";
import { validateUnknownEnumValue } from "./attributes/unknown-enum-value";
import { validateUnknownXmlnsNamespace } from "./attributes/unknown-xmlns-namespace";
import { validateBooleanValue } from "./attributes/invalid-boolean-value";
import { validateUseOfDeprecatedClass } from "./elements/use-of-deprecated-class";
import { validateNonUniqueID } from "./document/non-unique-id";
import { validateUnknownAttributeKey } from "./attributes/unknown-attribute-key";
import { validateUnknownTagName } from "./elements/unknown-tag-name";
import { validateExplicitAggregationCardinality } from "./elements/cardinality-of-aggregation";

export const allValidators: UI5Validators = {
  document: [validateNonUniqueID],
  element: [
    validateUseOfDeprecatedClass,
    validateUnknownTagName,
    validateExplicitAggregationCardinality,
  ],
  attribute: [
    validateUnknownEnumValue,
    validateUnknownXmlnsNamespace,
    validateBooleanValue,
    validateUnknownAttributeKey,
  ],
};
