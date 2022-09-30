// import {
//   Metadata,
//   MetadataElementFullyQualifiedName,
// } from "@ui5-language-assistant/semantic-model-types";

// export const METADATA_ENTITY_TYPE_KIND = "EntityType";

// export function getNavigationTargets(
//   metadata: Metadata,
//   entityTypeName: MetadataElementFullyQualifiedName,
//   isCollection?: boolean
// ): { property: string; targetName: string }[] {
//   const result: { property: string; targetName: string }[] = [];
//   const navTargets = metadata.navigationSourceMap[entityTypeName] || {};
//   Object.keys(navTargets)
//     .filter((targetName) => targetName !== entityTypeName)
//     .forEach((targetName) => {
//       const target = navTargets[targetName];
//       Object.keys(target).forEach((property) => {
//         if (
//           typeof isCollection !== "boolean" ||
//           target[property].isCollection === isCollection
//         ) {
//           result.push({ property, targetName });
//         }
//       });
//     });
//   return result;
// }

// function getFirstAssociationProperties2(
//   metadata: Metadata,
//   entityTypeName: MetadataElementFullyQualifiedName,
//   isCollection: boolean
// ) {
//   const result: string[] = [];
//   const entityType = metadata.lookupMap.get(entityTypeName);
//   if (entityType?.kind === METADATA_ENTITY_TYPE_KIND) {
//     entityType.navigationProperties.forEach((np) => {
//       if (np.isCollection === isCollection) {
//         const target = metadata.lookupMap.get(np.targetTypeName);
//         if (target?.kind === METADATA_ENTITY_TYPE_KIND) {
//           target.entityProperties.forEach((prop) => {
//             if (prop.edmPrimitiveType && prop.isCollection === isCollection) {
//               result.push(`${np.name}/${prop.name}`);
//             }
//           });
//         }
//       }
//     });
//   }
// }

// export function getFirstAssociationProperties(
//   metadata: Metadata,
//   cacheEntry: any,
//   entityType: MetadataElementFullyQualifiedName,
//   types: string[],
//   isCollection: boolean
// ): string[] {
//   const result: string[] = [];
//   const navTargets = metadata.navigationSourceMap[entityType] || {};
//   Object.keys(navTargets).forEach((targetName) => {
//     const target = navTargets[targetName];
//     Object.keys(target).forEach((property) => {
//       if (target[property].isCollection === isCollection) {
//         const targetProps = getPropertiesByTypes(cacheEntry, targetName, types);
//         result.push(...targetProps.map((tp) => `${property}/${tp}`));
//       }
//     });
//   });
//   return result;
// }

// export function getPropertiesByTypes(
//   cacheEntry: any,
//   entityType: MetadataElementFullyQualifiedName,
//   types: string[]
// ): string[] {
//   const result: string[] = [];
//   types.forEach((t) => {
//     const lookup = cacheEntry[t] || {};
//     const props = Object.keys(lookup[entityType] || {});
//     result.push(...props);
//   });
//   return result;
// }

// // function getNextPossibleNavSegments(metadata: Metadata, currentEntity: MetadataElementFullyQualifiedName, isCollection: boolean | undefined) {
// //   const targets = metadata.extendedNavigationMap[currentEntity] || {};
// //   const allowedTargets = Object.keys(targets)
// //     .map(key => targets[key])
// //     .filter(entry => {});
// // }

// // function collectPathResultsFromCache(cacheEntry: any, types: string[]) {
// //   const result: string[] = [];
// //   types.forEach(t => {
// //     resulObject.keys(cacheEntry[t] || {}).forEach(key => result.p);
// //   });
// // }
// // /E/P;

// // function findCacheObjectBySegments(
// //   segments: string[],
// //   currentObject: any
// // ): {
// //   caseIssues: CaseIssue | undefined;
// //   pathFound: boolean;
// //   currentObject: any;
// // } {
// //   let pathFound = true;
// //   // let caseIssues = undefined;
// //   (segments || []).forEach((segment, idx) => {
// //     if (currentObject[segment]) {
// //       currentObject = currentObject[segment];
// //     } else {
// //       pathFound = false;
// //       // if (valueHandlingContext.aliasInfo) {
// //       //     caseIssues = checkPathValuesNameCase(valueHandlingContext, segment, currentObject);
// //       // }
// //     }
// //   });
// //   return { pathFound, caseIssues: undefined, currentObject };
// // }
