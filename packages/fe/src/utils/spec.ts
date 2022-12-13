import { AllowedTargetType } from "./metadata";

export interface BuildingBlockPathConstraints {
  name: string;
  constraints: Record<
    string,
    {
      allowedAnnotations: AnnotationTerm[];
      allowedTargets: AllowedTargetType[];
    }
  >;
}
export interface BuildingBlockSpecification {
  name: string;
  contextPath?: {
    allowedAnnotations?: string[];
    allowedTargets?: AllowedTargetType[];
  };
  metaPath: {
    allowedAnnotations?: string[];
    allowedTargets: AllowedTargetType[];
  };
}

export const NAMESPACE_TO_ALIAS: Map<string, string> = new Map([
  ["Org.OData.Aggregation.V1", "Aggregation"],
  ["Org.OData.Authorization.V1", "Auth"],
  ["Org.OData.Capabilities.V1", "Capabilities"],
  ["Org.OData.Core.V1", "Core"],
  ["Org.OData.Measures.V1", "Measures"],
  ["Org.OData.Repeatability.V1", "Repeatability"],
  ["Org.OData.Temporal.V1", "Temporal"],
  ["Org.OData.Validation.V1", "Validation"],
  ["Org.OData.JSON.V1", "ODataJSON"],
  ["com.sap.vocabularies.Analytics.v1", "Analytics"],
  ["com.sap.vocabularies.CDS.v1", "CDS"],
  ["com.sap.vocabularies.CodeList.v1", "CodeList"],
  ["com.sap.vocabularies.Common.v1", "Common"],
  ["com.sap.vocabularies.Communication.v1", "Communication"],
  ["com.sap.vocabularies.DataIntegration.v1", "DataIntegration"],
  ["com.sap.vocabularies.DirectEdit.v1", "DirectEdit"],
  ["com.sap.vocabularies.Graph.v1", "Graph"],
  ["com.sap.vocabularies.Hierarchy.v1", "Hierarchy"],
  ["com.sap.vocabularies.ODM.v1", "ODM"],
  ["com.sap.vocabularies.PDF.v1", "PDF"],
  ["com.sap.vocabularies.PersonalData.v1", "PersonalData"],
  ["com.sap.vocabularies.Session.v1", "Session"],
  ["com.sap.vocabularies.UI.v1", "UI"],
  ["com.sap.vocabularies.HTML5.v1", "HTML5"],
]);

export interface AnnotationTerm {
  fullyQualifiedName: string;
  name: string;
  alias: string;
}

const specs: BuildingBlockSpecification[] = [
  {
    name: "FilterBar",
    metaPath: {
      allowedAnnotations: ["com.sap.vocabularies.UI.v1.SelectionFields"],
      allowedTargets: ["EntitySet", "EntityType"],
    },
  },
  {
    name: "Form",
    metaPath: {
      allowedAnnotations: [
        "com.sap.vocabularies.UI.v1.FieldGroup",
        "com.sap.vocabularies.UI.v1.CollectionFacet",
        "com.sap.vocabularies.UI.v1.ReferenceFacet",
      ],
      allowedTargets: [
        "EntitySet",
        "EntityType",
        "Singleton",
        "NavigationProperty",
      ],
    },
  },
  {
    name: "Field",
    metaPath: {
      allowedAnnotations: [],
      allowedTargets: [
        "EntitySet",
        "EntityType",
        "Singleton",
        "NavigationProperty",
        "Property",
      ],
    },
  },
  {
    name: "MicroChart",
    metaPath: {
      allowedAnnotations: ["com.sap.vocabularies.UI.v1.Chart"],
      allowedTargets: [],
    },
  },
  {
    name: "Chart",
    metaPath: {
      allowedAnnotations: ["com.sap.vocabularies.UI.v1.Chart"],
      allowedTargets: [
        "EntitySet",
        "EntityType",
        "Singleton",
        "NavigationProperty",
      ],
    },
    contextPath: {
      allowedTargets: [
        "EntitySet",
        "EntityType",
        "Singleton",
        "NavigationProperty",
      ],
    },
  },
  {
    name: "Table",
    metaPath: {
      allowedAnnotations: [
        "com.sap.vocabularies.UI.v1.LineItem",
        "com.sap.vocabularies.UI.v1.PresentationVariant",
        "com.sap.vocabularies.UI.v1.SelectionPresentationVariant",
      ],
      allowedTargets: [
        "EntitySet",
        "EntityType",
        "Singleton",
        "NavigationProperty",
      ],
    },
  },
];

const stringTermsToAnnotationTerms = (termNames: string[] | undefined) =>
  (termNames || []).map((fullyQualifiedName) => {
    return fullyQualifiedNameToTerm(fullyQualifiedName);
  });

export const specification: Record<
  string,
  BuildingBlockPathConstraints
> = specs.reduce(
  (acc: { [name: string]: BuildingBlockPathConstraints }, spec) => {
    acc[spec.name] = {
      name: spec.name,
      constraints: {
        metaPath: {
          allowedTargets: spec.metaPath.allowedTargets,
          allowedAnnotations: stringTermsToAnnotationTerms(
            spec.metaPath.allowedAnnotations
          ),
        },
        contextPath: {
          allowedTargets: spec.contextPath?.allowedTargets || [],
          allowedAnnotations: stringTermsToAnnotationTerms(
            spec.contextPath?.allowedAnnotations
          ),
        },
      },
    };
    return acc;
  },
  {}
);

export function fullyQualifiedNameToTerm(
  fullyQualifiedName: string
): AnnotationTerm {
  const segments = fullyQualifiedName.split(".");
  const namespace = segments.slice(0, -1).join(".");
  const [name] = segments.slice(-1);
  return {
    fullyQualifiedName,
    alias: NAMESPACE_TO_ALIAS.get(namespace) ?? "",
    name,
  };
}
