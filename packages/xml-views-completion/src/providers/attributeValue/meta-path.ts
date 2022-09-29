import {
  getAllowedAnnotationsTermsForControl,
  getElementAttributeValue,
  getUI5PropertyByXMLAttributeKey,
} from "@ui5-language-assistant/logic-utils";
import { AnnotationPathInXMLAttributeValueCompletion } from "../../../api";
import { UI5AttributeValueCompletionOptions } from "./index";
import { ConvertedMetadata } from "@sap-ux/vocabularies-types";
import { AnnotationTerm } from "@ui5-language-assistant/logic-utils/src/api";

export interface CompletionItem {
  name: string;
  text: string;
  commitCharacters: string[];
  commitCharacterRequired: boolean;
  // documentation: { kind: MarkupKind.Markdown, value: documentation.join('\n') }
}

/**
 * Suggests values for macros metaPath
 */
export function metaPathSuggestions({
  element,
  attribute,
  context,
  prefix,
}: UI5AttributeValueCompletionOptions): AnnotationPathInXMLAttributeValueCompletion[] {
  const result: AnnotationPathInXMLAttributeValueCompletion[] = [];
  const ui5Property = getUI5PropertyByXMLAttributeKey(
    attribute,
    context.ui5Model
  );

  if (
    ui5Property?.library === "sap.fe.macros" &&
    ui5Property.name === "metaPath"
  ) {
    let annotationList: any[] | undefined;
    // ui5Property.
    let contextPath = getElementAttributeValue(element, "contextPath");
    const control = element.name ?? "";
    const mainServicePath = context.manifest?.mainServicePath;
    const service = mainServicePath
      ? context.services[mainServicePath]
      : undefined;
    if (!service) {
      return [];
    }
    if (typeof contextPath === "string") {
      // TODO: resolve context and get annotations for it
    } else {
      const entitySet =
        context.manifest?.customViews[context.customViewId ?? ""]?.entitySet ??
        "";
      contextPath = `/${entitySet}`;
      const type = service.convertedMetadata.entitySets.find(
        (e) => e.name === entitySet
      )?.entityTypeName;
      if (type) {
        const allowedTerms = getAllowedAnnotationsTermsForControl(control);
        annotationList = collectAnnotationsForType(
          service.convertedMetadata,
          type,
          allowedTerms
        );
      }
    }

    // Annotation terms
    if (annotationList?.length) {
      result.push(
        ...annotationList.map((annotation) => {
          const fullPath = annotation.qualifier
            ? `${annotation.term}#${annotation.qualifier}`
            : annotation.term;
          return {
            type: "AnnotationPathInXMLAttributeValue",
            astNode: attribute,
            ui5Node: {
              kind: "AnnotationPath",
              name: `@${fullPath}`,
              value: `@${fullPath}`,
            },
          } as AnnotationPathInXMLAttributeValueCompletion;
        })
      );
    }
    return result;
  }

  return [];
}

function collectAnnotationsForType(
  convertedMetadata: ConvertedMetadata,
  entityType: string,
  allowedTerms: AnnotationTerm[]
): any[] {
  const type = convertedMetadata.entityTypes.find(
    (entity) => entity.fullyQualifiedName === entityType
  );
  const matchedAnnotations: any[] = [];
  if (type) {
    for (const term of allowedTerms) {
      const annotations = type.annotations[term.alias] ?? {};
      const paths = Object.keys(annotations);
      for (const path of paths) {
        const annotation = annotations[path];
        if (annotation.term === term.fullyQualifiedName) {
          matchedAnnotations.push(annotation);
        }
      }
    }
  }
  return matchedAnnotations;
}

// function resolveContextPath(convertedMetadata: ConvertedMetadata, contextPath: string): string | undefined {
//   if (!contextPath.startsWith('/')) {
//     // relative paths not supported;
//     return undefined;
//   }
//   const segments = contextPath.split('/');
//   const firstSegment = segments[0];
//   if (!firstSegment) {
//     return undefined
//   }
//   const entitySet = convertedMetadata.entitySets.
// }

// function collectPaths()
