// TODO: more precise definition of this type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare type UI5DistMetadata = any;

declare function fetchDistMetadata(version: string): Promise<UI5DistMetadata>;
