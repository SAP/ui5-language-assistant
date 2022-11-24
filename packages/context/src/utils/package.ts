export const getPackageName = (): string => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires -- Using `require` for .json file as this gets bundled with webpack correctly.
  const meta = require("../../../package.json");
  return meta.name;
};
