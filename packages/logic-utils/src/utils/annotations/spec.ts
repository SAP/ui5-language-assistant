export interface BuildingBlockSpecification {
  name: string;
  allowedTargets: string[];
  allowedAnnotations: AnnotationTerm[];
}
export interface BuildingBlockSpecificationCondensed {
  name: string;
  allowedAnnotations: string[];
  allowedTargets: string[];
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

const specs: BuildingBlockSpecificationCondensed[] = [
  {
    name: "FilterBar",
    allowedAnnotations: ["com.sap.vocabularies.UI.v1.SelectionFields"],
    allowedTargets: ["EntitySet", "EntityType"],
  },
  {
    name: "Form",
    allowedAnnotations: [
      "@com.sap.vocabularies.UI.v1.FieldGroup",
      "@com.sap.vocabularies.UI.v1.CollectionFacet",
      "@com.sap.vocabularies.UI.v1.ReferenceFacet",
    ],
    allowedTargets: [
      "EntitySet",
      "EntityType",
      "Singleton",
      "NavigationProperty",
    ],
  },
  {
    name: "Field",
    allowedAnnotations: [],
    allowedTargets: [
      "EntitySet",
      "EntityType",
      "Singleton",
      "NavigationProperty",
      "Property",
    ],
  },
  {
    name: "MicroChart",
    allowedAnnotations: ["com.sap.vocabularies.UI.v1.Chart"],
    allowedTargets: [],
  },
  {
    name: "Chart",
    allowedAnnotations: ["com.sap.vocabularies.UI.v1.Chart"],
    allowedTargets: [
      "EntitySet",
      "EntityType",
      "Singleton",
      "NavigationProperty",
    ],
  },
  {
    name: "Table",
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
];
export const specification = specs.reduce(
  (
    acc: {
      [name: string]: BuildingBlockSpecification;
    },
    spec
  ) => {
    acc[spec.name] = {
      name: spec.name,
      allowedTargets: spec.allowedTargets,
      allowedAnnotations: spec.allowedAnnotations.map((fullyQualifiedName) => {
        const segments = fullyQualifiedName.split(".");
        const namespace = segments.slice(0, -1).join(".");
        const [name] = segments.slice(-1);
        return {
          fullyQualifiedName,
          alias: NAMESPACE_TO_ALIAS.get(namespace) ?? "",
          name,
        };
      }),
    };
    return acc;
  },
  {}
);
