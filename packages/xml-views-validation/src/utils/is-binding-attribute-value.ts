export function isPossibleBindingAttributeValue(value: string): boolean {
  // Check if an attribute value might be a binding expression.
  // The current check is very naive - it only looks for matching curly brackets anywhere in the value.
  // In the future we might perform a more extensive check, but this is enough for now, so we don't
  // return false positives in attribute value validations.
  return /{(.*)}/.test(value);
}
