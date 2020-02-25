import { isEmpty, has, forEach } from "lodash";

export function newMap<T>(): Record<string, T> {
  // Create an object without a prototype so it doesn't have built-in methods like toString
  return Object.create(null);
}

export function getParentFqn(fqn: string, name: string): string | undefined {
  if (!isEmpty(fqn) && fqn.endsWith("." + name)) {
    return fqn.substring(0, fqn.length - (name.length + 1));
  }
  return undefined;
}

/* istanbul ignore next */
export function error(message: string, throwError: boolean): void {
  if (throwError) {
    throw new Error(message);
  } else {
    console.error(message);
  }
}

export function findKeyInMaps<T>(
  key: string,
  ...maps: Record<string, T>[]
): T | undefined {
  for (const map of maps) {
    if (has(map, key)) {
      return map[key];
    }
  }
  return undefined;
}

export function forEachMap<T>(
  predicate: (v: T, k: string) => unknown,
  ...maps: Record<string, T>[]
): void {
  for (const map of maps) {
    forEach(map, (v, k) => predicate(v, k));
  }
}
