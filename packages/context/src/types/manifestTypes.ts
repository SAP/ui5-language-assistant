/**
 * Manifest simplified interfaces.
 * Used to collect names of custom app templates declared in manifest.
 * Built based on types defined here
 * https://github.tools.sap/ux/sap.fe/blob/main/packages/sap.fe.core/src/sap/fe/core/converters/ManifestSettings.ts
 */

interface ManifestHeaderFacet {
  template?: string;
}

interface ManifestSubSection {
  template?: string;
  sideContent?: {
    template: string;
  };
}

export interface ManifestSection {
  template?: string;
  subSections?: Record<string, ManifestSubSection>;
}

export interface TableManifestConfiguration {
  columns?: Record<string, { template?: string }>;
}

export type FacetsControlConfiguration = {
  sections: Record<string, ManifestSection>;
};

export interface HeaderFacetsControlConfiguration {
  facets: Record<string, ManifestHeaderFacet>;
}

interface ManifestFormElement {
  template: string;
}

export interface FormManifestConfiguration {
  fields: Record<string, ManifestFormElement>;
}

interface FilterFieldManifestConfiguration {
  template?: string;
}

export interface FilterManifestConfiguration {
  filterFields?: Record<string, FilterFieldManifestConfiguration>;
}

export type ControlManifestConfiguration =
  | TableManifestConfiguration
  | FacetsControlConfiguration
  | HeaderFacetsControlConfiguration
  | FormManifestConfiguration
  | FilterManifestConfiguration;

export interface ManifestTargetOptionsSettings {
  entitySet?: string;
  contextPath?: string;
  viewName?: string;
  controlConfiguration?: Record<string, ControlManifestConfiguration>;
  content?: {
    header?: {
      facets?: Record<string, ManifestHeaderFacet>;
    };
    body?: {
      sections?: Record<string, ManifestSection>;
    };
  };
  views?: {
    paths: { template?: string }[];
  };
}

export interface ManifestTargetOptions {
  settings?: ManifestTargetOptionsSettings;
}
