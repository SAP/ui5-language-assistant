import {
  ConvertedMetadata,
  EntityContainer,
  EntityType,
  NavigationProperty,
  Property,
  Singleton,
} from "@sap-ux/vocabularies-types";
import { expect } from "chai";
import { getNextPossiblePathTargets, resolvePathTarget } from "../../src/utils";

describe("path utils (exotic cases to achieve full code coverage)", () => {
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

  it("case when no allowed types provided in options", () => {
    const result = getNextPossiblePathTargets(
      metadata,
      travelEntityType,
      false,
      {
        isPropertyPath: true,
      },
      []
    );
    expect(result.length).to.eq(2);
  });

  it("case when no allowed terms provided in options", () => {
    const result = getNextPossiblePathTargets(
      metadata,
      travelEntityType,
      false,
      {
        allowedTargets: ["EntityType"],
        isPropertyPath: false,
      },
      []
    );
    expect(result.length).to.eq(1);
  });

  it("case with entity container and singletone", () => {
    const result = getNextPossiblePathTargets(
      metadata,
      entityContainer,
      false,
      {
        allowedTargets: ["EntityType", "Singleton", "EntitySet"],
        isPropertyPath: true,
      },
      []
    );
    expect(result.map((i) => i.name)).to.deep.equal(["TravelConfig"]);
  });

  it("case with entity container and not allowed child types", () => {
    const result = getNextPossiblePathTargets(
      metadata,
      entityContainer,
      false,
      {
        allowedTargets: ["EntityType"],
        isPropertyPath: true,
      },
      []
    );
    expect(result.length).to.eq(0);
  });

  it("edge case with", () => {
    const result = resolvePathTarget(metadata, "to_Booking");
    expect(result.target).to.be.undefined;
  });
});
