export type { AnnotationIssue } from "./issues";
export { ANNOTATION_ISSUE_TYPE } from "./issues";

export { AnnotationTerm } from "./metadata";
export {
  UI5XMLViewAnnotationCompletion,
  AnnotationPathInXMLAttributeValueCompletion,
  AnnotationTargetInXMLAttributeValueCompletion,
  PropertyPathInXMLAttributeValueCompletion,
} from "./completion";

export const SAP_FE_MACROS = "sap.fe.macros";

export type AnnotationBase = {
  term: string;
  qualifier: string;
};

export enum ContextPathOrigin {
  xmlAttributeInContextPath = "xml-attribute-in-context-path",
  xmlAttributeInMetaPath = "xml-attribute-in-meta-path",
  contextPathInManifest = "context-path-in-manifest",
  entitySetInManifest = "entitySet-in-manifest",
}

export interface ResolveContextPath {
  contextPath: string;
  origin: ContextPathOrigin;
}
