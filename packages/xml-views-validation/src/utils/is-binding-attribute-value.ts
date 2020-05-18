export function isPossibleBindingAttributeValue(value: string): boolean {
  // Check if an attribute value might be a binding expression.
  // The current check doesn't diffrenciate between attribute types, although for non-string
  // attributes the check can be simpler.
  // Note that the syntax might not be correct (e.g. there is no check for balanced brackets)
  // but the runtime will still treat it as a binding expression even in that case (it will throw an error).
  // This will match everything that contains an un-escaped { character.
  return /^(?:[^\\]|\\.)*{/.test(value);
}
