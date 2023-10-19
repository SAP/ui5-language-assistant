import deepFreezeStrict from "deep-freeze-strict";
import { UI5ValidatorsConfig } from "@ui5-language-assistant/xml-views-validation";
import { BindingIssue } from "../../../types";
import { validateBinding } from "./binding-validator";

export const bindingValidators: UI5ValidatorsConfig<BindingIssue> = {
  document: [],
  element: [],
  attribute: [validateBinding],
};

deepFreezeStrict(bindingValidators);
