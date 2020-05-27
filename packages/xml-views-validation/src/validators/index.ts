import { UI5Validators } from "../validate-xml-views";
import { validateUnknownEnumValue } from "./attributes/unknown-enum-value";
import { validateUnknownXmlnsNamespace } from "./attributes/unknown-xmlns-namespace";
import { validateBooleanValue } from "./attributes/invalid-boolean-value";
import { validateUseOfDeprecatedClass } from "./elements/use-of-deprecated-class";
import { validateUnknownAttributeKey } from "./attributes/unknown-attribute-key";
import { validateUnknownTagName } from "./elements/unknown-tag-name";
import { validateCardinality } from "./elements/cardinality-of-aggregation";

export const allValidators: UI5Validators = {
  element: [
    validateUseOfDeprecatedClass,
    validateUnknownTagName,
    validateCardinality,
  ],
  attribute: [
    validateUnknownEnumValue,
    validateUnknownXmlnsNamespace,
    validateBooleanValue,
    validateUnknownAttributeKey,
  ],
};
