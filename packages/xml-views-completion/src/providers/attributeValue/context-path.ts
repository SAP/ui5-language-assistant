import {
  getAllowedAnnotationsTermsForControl,
  getElementAttributeValue,
  getEntitySetFromController,
  getUI5PropertyByXMLAttributeKey,
} from "@ui5-language-assistant/logic-utils";
import {
  AnnotationPathInXMLAttributeValueCompletion,
  AnnotationTargetInXMLAttributeValueCompletion,
} from "../../../api";
import { UI5AttributeValueCompletionOptions } from "./index";
import { ConvertedMetadata } from "@sap-ux/vocabularies-types";
import { AnnotationTerm } from "@ui5-language-assistant/logic-utils/src/api";
import { ServiceDetails } from "@ui5-language-assistant/semantic-model-types";
import {
  collectAnnotationsForType,
  getNavigationTargets,
} from "../utils/annotationUtils";

export interface CompletionItem {
  name: string;
  text: string;
  commitCharacters: string[];
  commitCharacterRequired: boolean;
  // documentation: { kind: MarkupKind.Markdown, value: documentation.join('\n') }
}

/**
 * Suggests values for macros contextPath
 */
export function contextPathSuggestions({
  element,
  attribute,
  context,
  prefix,
}: UI5AttributeValueCompletionOptions): AnnotationTargetInXMLAttributeValueCompletion[] {
  const ui5Property = getUI5PropertyByXMLAttributeKey(
    attribute,
    context.ui5Model
  );

  if (
    ui5Property?.library === "sap.fe.macros" &&
    ui5Property.name === "contextPath"
  ) {
    let annotationList: any[] | undefined;
    const control = element.name ?? "";
    const mainServicePath = context.manifest?.mainServicePath;
    const service = mainServicePath
      ? context.services[mainServicePath]
      : undefined;
    if (!service) {
      return [];
    }

    const allowedTerms = getAllowedAnnotationsTermsForControl(control);

    const targets = (allowedTerms.length
      ? service.convertedMetadata.entityTypes.filter((entity) => {
          annotationList = collectAnnotationsForType(
            service.convertedMetadata,
            entity.fullyQualifiedName,
            allowedTerms
          );
          return annotationList.length > 0;
        })
      : service.convertedMetadata.entityTypes
    ).map((target) => `/${target.name}`);

    const targetList = [
      ...targets,
      ...getNavigationTargets(service, {
        allowedTerms,
        isPropertyPath: control === "Field",
      }),
    ];

    return targetList.map((target) => {
      return {
        type: "AnnotationTargetInXMLAttributeValue",
        astNode: attribute,
        ui5Node: {
          kind: "AnnotationTarget",
          name: target,
          value: target,
        },
      } as AnnotationTargetInXMLAttributeValueCompletion;
    });
  }
  return [];
}
