import deepFreezeStrict from "deep-freeze-strict";
import { UI5ValidatorsConfig } from "@ui5-language-assistant/xml-views-validation";
import { validateUnknownAnnotationTarget } from "./unknown-annotation-target";
import { AnnotationIssue } from "../../../types";
import { validateUnknownAnnotationPath } from "./unknown-annotation-path";
import { validateUnknownPropertyPath } from "./unknown-property-path";
import { validateFilterBarId } from "./wrong-filter-bar-id";
import { validateMissingViewEntitySet } from "./missing-entity-set";

export const defaultValidators: UI5ValidatorsConfig<AnnotationIssue> = {
  document: [],
  element: [],
  attribute: [
    validateUnknownAnnotationTarget,
    validateUnknownAnnotationPath,
    validateUnknownPropertyPath,
    validateFilterBarId,
    validateMissingViewEntitySet,
  ],
};

deepFreezeStrict(defaultValidators);
