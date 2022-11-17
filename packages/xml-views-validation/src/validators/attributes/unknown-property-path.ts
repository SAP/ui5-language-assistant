import { XMLAttribute } from "@xml-tools/ast";
import { AppContext } from "@ui5-language-assistant/semantic-model-types";
import {
  getElementAttributeValue,
  getUI5PropertyByXMLAttributeKey,
  isPropertyPathAllowed,
  resolvePathTarget,
  getNextPossiblePathTargets,
} from "@ui5-language-assistant/logic-utils";

import { AnnotationIssue } from "../../../api";
import { isPossibleBindingAttributeValue } from "../../utils/is-binding-attribute-value";
import {
  EntityContainer,
  EntitySet,
  Singleton,
  EntityType,
  Property,
} from "@sap-ux/vocabularies-types";
import { getNavigationTargets } from "@ui5-language-assistant/xml-views-completion";

export function validateUnknownPropertyPath(
  attribute: XMLAttribute,
  context: AppContext
): AnnotationIssue[] {
  const actualAttributeValue = attribute.value;
  const actualAttributeValueToken = attribute.syntax.value;
  if (
    actualAttributeValue === null ||
    actualAttributeValueToken === undefined ||
    isPossibleBindingAttributeValue(actualAttributeValue)
  ) {
    return [];
  }

  const ui5Property = getUI5PropertyByXMLAttributeKey(
    attribute,
    context.ui5Model
  );
  if (
    ui5Property?.library === "sap.fe.macros" &&
    ui5Property.name === "metaPath"
  ) {
    const element = attribute.parent;
    const control = element.name ?? "";

    const mainServicePath = context.manifest?.mainServicePath;
    const service = mainServicePath
      ? context.services[mainServicePath]
      : undefined;
    if (!service) {
      return [];
    }
    const metadata = service.convertedMetadata;
    let contextPath = getElementAttributeValue(element, "contextPath");
    const entitySet =
      (context.manifest?.customViews || {})[context.customViewId || ""]
        ?.entitySet ?? "";

    let isNavSegmentsAllowed = true;
    let base:
      | EntityContainer
      | EntitySet
      | EntityType
      | Singleton
      | Property
      | undefined;
    let baseType: EntityType | undefined;

    // resolve context
    if (typeof contextPath === "string") {
      if (!contextPath.startsWith("/")) {
        return [];
      }
      ({ target: base, targetStructuredType: baseType } = resolvePathTarget(
        metadata,
        contextPath
      ));
      isNavSegmentsAllowed = false;
    } else {
      if (!entitySet) {
        return [
          {
            kind: "MissingEntitySet",
            message:
              "EntitySet for the current view is missing in application manifest. Attribute value completion and diagnostics are disabled",
            offsetRange: {
              start: actualAttributeValueToken.startOffset,
              end: actualAttributeValueToken.endOffset,
            },
            severity: "info",
          },
        ];
      }
      contextPath = `/${entitySet}`;
      base = service.convertedMetadata.entitySets.find(
        (e) => e.name === entitySet
      );
      baseType = base?.entityType;
    }

    // let targetList: string[];
    // if (baseType && isPropertyPathAllowed(control)) {
    //   // direct props and ones reachable via navigation
    //   if (isNavSegmentsAllowed) {
    //     targetList = getNavigationTargets(service, {
    //       allowedTerms: [],
    //       includeProperties: true,
    //       isPropertyPath: true,
    //       relativeFor: baseType,
    //     });
    //   } else {
    //     // direct props
    //     targetList = baseType.entityProperties.map(prop => prop.name);
    //   }
    // } else {
    //   return [];
    // }

    // if (targetList.includes(attribute.value || '')) {
    //   return [];
    // }

    if (!attribute.value) {
      return [
        {
          kind: "PropertyPathRequired",
          message: "Property path is required",
          offsetRange: {
            start: actualAttributeValueToken.startOffset,
            end: actualAttributeValueToken.endOffset,
          },
          severity: "warn",
        },
      ];
    }

    // resolve by segments
    const segments = (attribute.value || "").split("/");
    const originalSegments = [...segments];
    if (segments.length > 1 && !isNavSegmentsAllowed) {
      return [
        {
          kind: "InvalidAnnotationTerm",
          message: `Navigation segments not allowed when contextPath is provided`,
          offsetRange: {
            start: actualAttributeValueToken.startOffset,
            end: actualAttributeValueToken.endOffset,
          },
          severity: "warn",
        } as AnnotationIssue,
      ];
    }

    let targetEntity: EntityType | undefined = baseType;
    let targetProperty: Property | undefined;
    let lastValidSegmentIndex = -1;
    let isAbsolutePath = false;
    if (segments.length > 1 && !segments[0]) {
      // absolute path
      segments.shift();
      targetEntity = service.convertedMetadata.entityTypes.find(
        (entityType) => entityType.name === segments[0]
      );
      lastValidSegmentIndex = targetEntity ? 1 : 0;
      isAbsolutePath = true;
      segments.shift();
      if (!segments.length) {
        return [
          targetEntity
            ? {
                kind: "UnknownPropertyPath",
                message: `Path should lead to property or navigation property: "${attribute.value}"`,
                offsetRange: {
                  start: actualAttributeValueToken.startOffset,
                  end: actualAttributeValueToken.endOffset,
                },
                severity: "warn",
              }
            : {
                kind: "PathDoesNotExist",
                message: `Path does not exist: "${attribute.value}"`,
                offsetRange: {
                  start: actualAttributeValueToken.startOffset,
                  end: actualAttributeValueToken.endOffset,
                },
                severity: "warn",
              },
        ];
      }
    }

    if (targetEntity) {
      for (const segment of segments) {
        if (!targetEntity) {
          break;
        }
        const navProperty = targetEntity.navigationProperties.find(
          (p) => p.name === segment
        );
        targetProperty = targetEntity.entityProperties.find(
          (p) => p.name === segment
        );
        targetEntity = navProperty?.targetType;
        if (targetEntity || targetProperty) {
          lastValidSegmentIndex++;
        }
      }
    }
    if (!targetEntity) {
      if (
        !targetProperty ||
        lastValidSegmentIndex < originalSegments.length - 1
      ) {
        originalSegments.splice(lastValidSegmentIndex + 1);
        const correctPart = originalSegments.join("/");
        return [
          {
            kind: "PathDoesNotExist",
            message: `Path does not exist: "${
              isAbsolutePath ? "" : contextPath + "/"
            }${attribute.value}"`,
            offsetRange: {
              start:
                actualAttributeValueToken.startOffset + correctPart.length + 1,
              end: actualAttributeValueToken.endOffset - 1,
            },
            severity: "warn",
          },
        ];
      }
    } else {
      // path exists
      return [];
    }
  }

  return [];
}
