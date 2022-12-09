import {
  ConvertedMetadata,
  EntityContainer,
  EntityType,
  NavigationProperty,
  Property,
  Singleton,
} from "@sap-ux/vocabularies-types";
import { expect } from "chai";
import {
  collectAnnotationsForElement,
  fullyQualifiedNameToTerm,
  getAnnotationAppliedOnElement,
  getRootElements,
} from "../../src/utils";

const entityContainer: EntityContainer = {
  _type: "EntityContainer",
  annotations: {},
  fullyQualifiedName: "TravelService.EntityContainer",
  name: "EntityContainer",
};
const bookingEntityType: EntityType = ({
  _type: "EntityType",
  name: "Booking",
  navigationProperties: [],
  entityProperties: [
    {
      _type: "Property",
      name: "BookingDate",
      annotations: {
        UI: {
          Hidden: { term: "com.sap.vocabularies.UI.v1.Hidden" },
        },
      },
    } as Property,
  ],
} as unknown) as EntityType;

const travelEntityType: EntityType = ({
  _type: "EntityType",
  name: "Travel",
  entityProperties: [
    {
      _type: "Property",
      name: "BeginDate",
    } as Property,
  ],
  navigationProperties: [
    {
      _type: "NavigationProperty",
      name: "to_Booking",
      isCollection: false,
      targetTypeName: "TravelService.Booking",
      targetType: bookingEntityType,
      annotations: {
        UI: {
          Hidden: {
            term: "com.sap.vocabularies.UI.v1.Hidden",
            qualifier: "q1",
          },
        },
      },
    } as NavigationProperty,
  ],
} as unknown) as EntityType;

const testSingleton: Singleton = ({
  _type: "Singleton",
  entityType: travelEntityType,
  entityTypeName: "Travel",
  name: "TravelConfig",
} as unknown) as Singleton;

const metadata: ConvertedMetadata = ({
  entityContainer,
  entitySets: [],
  entityTypes: [travelEntityType, bookingEntityType],
  namespace: "TravelService",
  singletons: [testSingleton],
} as unknown) as ConvertedMetadata;

describe("metadata edge cases", () => {
  it("annotations for undefined element", () => {
    const result = collectAnnotationsForElement(
      [fullyQualifiedNameToTerm("com.sap.vocabularies.UI.v1.Chart")],
      undefined
    );
    expect(result.length).to.eq(0);
  });

  it("no allowed types", () => {
    const result = getRootElements(metadata, [], [], true);
    expect(result).to.be.empty;
  });

  it("annotations on property", () => {
    const result = collectAnnotationsForElement(
      [
        {
          alias: "UI",
          fullyQualifiedName: "com.sap.vocabularies.UI.v1.Hidden",
          name: "UI.Hidden",
        },
      ],
      bookingEntityType,
      "BookingDate"
    );
    expect(result.length).to.eq(1);
    expect(result[0].term).to.eq("com.sap.vocabularies.UI.v1.Hidden");
    expect(result[0].qualifier).to.be.undefined;
  });

  it("annotations on navigation property", () => {
    const result = collectAnnotationsForElement(
      [
        {
          alias: "UI",
          fullyQualifiedName: "com.sap.vocabularies.UI.v1.Hidden",
          name: "UI.Hidden",
        },
      ],
      travelEntityType,
      undefined,
      "to_Booking"
    );
    expect(result.length).to.eq(1);
    expect(result[0].term).to.eq("com.sap.vocabularies.UI.v1.Hidden");
    expect(result[0].qualifier).to.eq("q1");
  });

  it("non existing property name", () => {
    const result = collectAnnotationsForElement(
      [
        {
          alias: "UI",
          fullyQualifiedName: "com.sap.vocabularies.UI.v1.Hidden",
          name: "UI.Hidden",
        },
      ],
      travelEntityType,
      "test"
    );
    expect(result.length).to.eq(0);
  });

  it("annotations on entity container", () => {
    const result = getAnnotationAppliedOnElement(metadata, [], entityContainer);
    expect(result.length).to.eq(0);
  });
});
