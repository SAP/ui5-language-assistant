/**
 * Syntax of a binding expression can be represented by `{=expression}` or `{:=expression}`
 * If an input text starts with either `{=` or `{:=`, input text is considered as binding expression
 */
export const isBindingExpression = (input: string): boolean => {
  input = input.trim();
  return /^{(=|:=)/.test(input);
};

/**
 * Property Binding Info can be without properties e.g `{/company/street}` or with property e.g
 * `{path: '/company/street'}`. If an input contains `'` or `"` character, it must be with properties
 * @note it must be inside `{}` and it is an approx condition checking
 */
export const isPropertyBindingInfoWitProperties = (input: string): boolean => {
  return /'|"/.test(input);
};

/**
 * remote all skipped char
check without skipped char and find starting { or {:= or {= 
find closing index
extract from original text
also position info calculated here
 * @param input 

 */
export const extractBindingExpression = (input: string): string => {
  var rFragments = /(\\[\\\{\}])|(\{)/g;
  let m;
  // while ((m = rFragments.exec(input)) !== null) {
  //     console.log(m);
  // }

  return input;
};
