const { copySync, readdirSync } = require("fs-extra");
const { join } = require("path");

const baseSrc = join(__dirname, "..", "..", "vscode-ui5-language-assistant");
const baseDes = join(__dirname, "..");

const vsixFiles = [];
readdirSync(baseSrc).forEach((item) => {
  if (item.endsWith(".vsix")) {
    vsixFiles.push(item);
    return item;
  }
});
if (vsixFiles.length > 1) {
  throw new Error(
    `Detected more than one ".vsix" files. There should be only one ".vsix" file. Please cross check and try again.`,
    { cause: vsixFiles }
  );
}
const vsixFile = vsixFiles.pop();
if (!vsixFile) {
  console.log(`There is not vsix under ${baseSrc}`);
  throw new Error(
    `There is no ".vsix" file. Please make sure a recent ".vsix" file is build under ${baseSrc} and try again.`,
    { cause: vsixFiles }
  );
}
const srcVsix = join(baseSrc, vsixFile);
const destinationVsix = join(baseDes, vsixFile);
console.log(`Copying from ${srcVsix} to ${destinationVsix}`);
copySync(srcVsix, destinationVsix);
console.log("Copying finished successfully");
