import deepFreezeStrict from "deep-freeze-strict";
import { UI5ValidatorsConfig } from "@ui5-language-assistant/xml-views-validation";
import { BindingIssue } from "../../../types";
import { validatePropertyBindingInfo } from "./property-binding-info-validator";

export const bindingValidators: UI5ValidatorsConfig<BindingIssue> = {
  document: [],
  element: [],
  attribute: [validatePropertyBindingInfo],
};

deepFreezeStrict(bindingValidators);
