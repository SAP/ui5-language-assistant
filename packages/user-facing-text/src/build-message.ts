/**
 * Build a message from given template and arguments.
 */
export function buildMessage(template: string, ...params: string[]): string {
  let result = template;
  for (let index = 0; index < params.length; index++) {
    const param = params[index];
    result = result.replace(new RegExp(`\\{${index}}`, "g"), param);
  }
  return result;
}
