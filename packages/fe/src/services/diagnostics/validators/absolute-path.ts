import { XMLAttribute } from "@xml-tools/ast";
import { Context } from "@ui5-language-assistant/context";
import { getUI5PropertyByXMLAttributeKey } from "@ui5-language-assistant/logic-utils";
import { isPossibleBindingAttributeValue } from "@ui5-language-assistant/xml-views-validation";
import {
  AnnotationIssue,
  ANNOTATION_ISSUE_TYPE,
  SAP_FE_MACROS,
} from "../../../types";
import {
  getPathConstraintsForControl,
  isPropertyPathAllowed,
  resolvePathTarget,
  getAnnotationAppliedOnElement,
  normalizePath,
  TypeNameMap,
  t,
  AnnotationTerm,
  AllowedTargetType,
  ResolvedPathTargetType,
} from "../../../utils";
import {
  EntityContainer,
  EntitySet,
  EntityType,
  Singleton,
} from "@sap-ux/vocabularies-types";
import { ServiceDetails } from "@ui5-language-assistant/context/src/types";

interface ValidateAbsolutePathResult {
  issues: AnnotationIssue[];
  resolvedTarget: ResolvedPathTargetType | undefined;
}
export function validateAbsolutePath(
  attribute: XMLAttribute,
  absolutePath: string,
  expectedTypes: AllowedTargetType[],
  expectedTypesMetaPath: AllowedTargetType[],
  isPropertyPath: boolean,
  service: ServiceDetails,
  isNotRecommended = false
): ValidateAbsolutePathResult {
  // always must be defined
  // const actualAttributeValue = attribute.value!;
  // always must be defined
  const actualAttributeValueToken = attribute.syntax.value!;

  const result: ValidateAbsolutePathResult = {
    issues: [],
    resolvedTarget: undefined,
  };
  const pushToResult = (item: AnnotationIssue) => {
    result.issues.push(item);
    return result;
  };

  if (!absolutePath.startsWith("/")) {
    return pushToResult({
      kind: "UnknownEnumValue",
      issueType: ANNOTATION_ISSUE_TYPE,
      message: t("INVALID_CONTEXT_PATH_VALUE", {
        value: absolutePath,
      }),
      offsetRange: {
        start: actualAttributeValueToken.startOffset,
        end: actualAttributeValueToken.endOffset,
      },
      severity: "warn",
    });
  }

  const normalizedValue = normalizePath(absolutePath);
  const expectedTypesList = (
    isNotRecommended ? expectedTypesMetaPath : expectedTypes
  )
    .map((item) => TypeNameMap[item])
    .join(", ");

  // Check by segments
  const {
    target,
    targetStructuredType: targetEntity,
    isCardinalityIssue,
    lastValidSegmentIndex,
  } = resolvePathTarget(service.convertedMetadata, normalizedValue);
  const originalSegments = absolutePath.split("/");

  result.resolvedTarget = target;

  if (target?._type === "Property") {
    return pushToResult({
      kind: "UnknownEnumValue",
      issueType: ANNOTATION_ISSUE_TYPE,
      message: t("CONTEXT_PATH_LEADS_TO_WRONG_TARGET", {
        actualType: "Edm.Property",
        expectedTypes: expectedTypesList,
      }),
      offsetRange: {
        start: actualAttributeValueToken.startOffset,
        end: actualAttributeValueToken.endOffset,
      },
      severity: "warn",
    });
  }

  if (target?._type === "EntityContainer") {
    const message = t(
      isNotRecommended
        ? "INCOMPLETE_CONTEXT_PATH_LEADS_TO_ENTITY_CONTAINER"
        : "INCOMPLETE_CONTEXT_PATH_TRIGGER_CODE_COMPLETION"
    );
    return pushToResult({
      kind: "IncompletePath",
      issueType: ANNOTATION_ISSUE_TYPE,
      message,
      offsetRange: {
        start: actualAttributeValueToken.startOffset,
        end: actualAttributeValueToken.endOffset,
      },
      severity: "warn",
    });
  }

  if (!target || !targetEntity) {
    if (!isCardinalityIssue) {
      // Path does not exist
      originalSegments.splice(lastValidSegmentIndex + 1);
      const correctPart = originalSegments.length
        ? "/" + originalSegments.join("/")
        : "";
      return pushToResult({
        kind: "UnknownEnumValue",
        issueType: ANNOTATION_ISSUE_TYPE,
        message: t("UNKNOWN_CONTEXT_PATH", { value: absolutePath }), // todo -> check value and affected range
        offsetRange: {
          start: actualAttributeValueToken.startOffset + correctPart.length + 1,
          end: actualAttributeValueToken.endOffset - 1,
        },
        severity: "warn",
      });
    } else {
      // segment found but preceding path leads to collection
      originalSegments.splice(lastValidSegmentIndex + 1);
      const correctPart = originalSegments.join("/");
      return pushToResult({
        kind: "UnknownEnumValue",
        issueType: ANNOTATION_ISSUE_TYPE,
        message: t("INVALID_CONTEXT_PATH_MULTIPLE_1_TO_MANY"),
        offsetRange: {
          start: actualAttributeValueToken.startOffset + correctPart.length + 1,
          end: actualAttributeValueToken.endOffset - 1,
        },
        severity: "warn",
      });
    }
  } else {
    if (
      (!isNotRecommended && !expectedTypes.includes(target._type)) ||
      (isNotRecommended && !expectedTypesMetaPath.includes(target._type))
    ) {
      return pushToResult({
        kind: "InvalidAnnotationTarget",
        issueType: ANNOTATION_ISSUE_TYPE,
        message: t("CONTEXT_PATH_LEADS_TO_WRONG_TARGET", {
          actualType: TypeNameMap[target._type],
          expectedTypes: expectedTypesList,
        }),
        offsetRange: {
          start: actualAttributeValueToken.startOffset,
          end: actualAttributeValueToken.endOffset,
        },
        severity: "warn",
      });
    }

    if (isPropertyPath) {
      return {
        issues: [],
        resolvedTarget: target,
      };
    }

    // TODO: required and actual cardinality mismatch check
    // return pushToResult(issue);
    //   }
  }
  return result;
}
