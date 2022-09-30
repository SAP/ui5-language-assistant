import {
  ConvertedMetadata,
  EntityType,
  Property,
  NavigationProperty,
} from "@sap-ux/vocabularies-types";
import { AnnotationTerm } from "@ui5-language-assistant/logic-utils/src/api";

// export function isPropertyPathAllowed(control: string): boolean {
//   return control === 'Field';
// }

// export function collectAnnotationsForType(
//   convertedMetadata: ConvertedMetadata,
//   entityType: string | EntityType,
//   allowedTerms: AnnotationTerm[],
//   property?: string,
//   navigationProperty?: string
// ): any[] {
//   const type = typeof entityType === 'string' ? convertedMetadata.entityTypes.find(entity => entity.fullyQualifiedName === entityType) : entityType;
//   const matchedAnnotations: any[] = [];
//   if (type) {
//     let target: EntityType | Property | NavigationProperty | undefined;
//     if (property) {
//       target = type.entityProperties.find(p => p.name === property);
//     } else if (navigationProperty) {
//       target = type.navigationProperties.find(p => p.name === property);
//     } else {
//       target = type;
//     }
//     if (!target) {
//       return [];
//     }
//     for (const term of allowedTerms) {
//       const annotations = target.annotations[term.alias] || {};
//       const paths = Object.keys(annotations);
//       for (const path of paths) {
//         const annotation = annotations[path];
//         if (annotation.term === term.fullyQualifiedName) {
//           matchedAnnotations.push(annotation);
//         }
//       }
//     }
//   }
//   return matchedAnnotations;
// }

// export function getNavigationTargets(service: ServiceDetails, allowedTerms: AnnotationTerm[], isCollection?: boolean, isPropertyPath?: boolean): string[] {
//   const isTargetValid = (target: EntityType) => {
//     if (!isPropertyPath) {
//       const annotationList = collectAnnotationsForType(service.convertedMetadata, target, allowedTerms);
//       return annotationList.length > 0;
//     } else {
//       return true;
//     }
//   };

//   const result: string[] = [];
//   service.convertedMetadata.entityTypes.forEach(entity => {
//     const props = entity.navigationProperties.filter(navProperty => {
//       if (navProperty.targetType === entity) {
//         return false; // navigation to entity itself
//       }
//       if (typeof isCollection === 'boolean' && navProperty.isCollection !== isCollection) {
//         return false;
//       }
//       const type = navProperty.targetType;

//       return isTargetValid(type);
//     });

//     result.push(...props.map(prop => `/${entity.name}/${prop.name}`));

//     // second level associations
//     entity.navigationProperties.forEach(navProperty1 => {
//       if (navProperty1.targetType !== entity) {
//         const type1 = navProperty1.targetType;
//         const props = type1.navigationProperties.filter(navProperty2 => {
//           if (
//             navProperty2.targetType === type1 || // self-navigation
//             navProperty2.targetType === entity || // cyclic navigation
//             navProperty1.isCollection ||
//             (typeof isCollection === 'boolean' && navProperty2.isCollection !== isCollection) // wrong cardinality
//             // (navProperty1.isCollection && navProperty2.isCollection) || // multiple 1:many segments
//             // (typeof isCollection === "boolean" &&
//             //   (navProperty1.isCollection || navProperty2.isCollection) !==
//             //     isCollection) // wrong cardinality
//           ) {
//             return false;
//           }
//           const type2 = navProperty2.targetType;
//           return isTargetValid(type2);
//         });
//         result.push(...props.map(prop => `/${entity.name}/${navProperty1.name}/${prop.name}`));
//       }
//     });
//   });

//   return result;
// }
