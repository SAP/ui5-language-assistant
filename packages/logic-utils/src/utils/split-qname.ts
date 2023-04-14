import { includes } from "lodash";

export function splitQNameByNamespace(qName: string): {
  prefix: string | undefined;
  localName: string;
} {
  if (!includes(qName, ":")) {
    return { prefix: undefined, localName: qName };
  }
  const match = qName.match(/(?<ns>[^:]*)(:(?<name>.*))?/);
  // There will always be a match because qName always contains a colon at this point
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const matchGroups = match!.groups!;
  return {
    prefix: matchGroups.ns,
    localName: matchGroups.name,
  };
}
