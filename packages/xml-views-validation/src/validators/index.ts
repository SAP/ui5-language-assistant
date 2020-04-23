import { UI5Validators } from "../validate-xml-views";
import { validateUnknownEnumValue } from "./attributes/unknown-enum-value";
import { validateUseOfDeprecatedClass } from "./elements/use-of-deprecated-class";

export const allValidators: UI5Validators = {
  element: [validateUseOfDeprecatedClass],
  attribute: [validateUnknownEnumValue]
};
