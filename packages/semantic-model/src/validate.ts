import Ajv, { ValidateFunction } from "ajv";
import { Json } from "../api";
import { SchemaForApiJsonFiles } from "./api-json";
import * as schema from "@ui5-language-assistant/semantic-model/resources/sap-ui-library-api.json";
import * as jsonDraft06Schema from "ajv/lib/refs/json-schema-draft-06.json";
import { isPlainObject, isArray } from "lodash";

const validate = createSchemaValidator();

function createSchemaValidator(): ValidateFunction {
  // ownProperties is required for "constructor" property on class (otherwise it validates the object constructor)
  const ajv = new Ajv({ ownProperties: true });
  // By default only schema draft-07 is supported
  ajv.addMetaSchema(jsonDraft06Schema);
  const validate = ajv.compile(schema);
  return validate;
}

export function isLibraryFile(
  fileName: string,
  fileContent: Json,
  strict: boolean,
  printValidationErrors: boolean
): fileContent is SchemaForApiJsonFiles {
  const valid = validate(fileContent);

  // Only printing when requested because the output is very verbose so it should only used for debugging.
  /* istanbul ignore if */
  if (!valid && printValidationErrors) {
    console.log(JSON.stringify(validate.errors, undefined, 2));
  }

  if (!strict) {
    if (!valid) {
      // We only return an error in non-strict mode if symbols is not an array
      return (
        isPlainObject(fileContent) &&
        isArray((fileContent as Record<string, unknown>).symbols)
      );
    }
    return true;
  }
  return valid as boolean;
}
