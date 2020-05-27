import { includes } from "lodash";

export function splitQNameByNamespace(
  qName: string
): { ns: string | undefined; name: string } {
  if (!includes(qName, ":")) {
    return { name: qName, ns: undefined };
  }
  const match = qName.match(/(?<ns>[^:]*)(:(?<name>.*))?/);
  // There will always be a match because qName always contains a colon at this point
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const matchGroups = match!.groups!;
  return {
    ns: matchGroups.ns,
    name:
      matchGroups.name ??
      /* istanbul ignore next */
      "",
  };
}
