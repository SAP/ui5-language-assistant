const { copySync, readdirSync } = require("fs-extra");
const { join } = require("path");

const getBaseSrc = () =>
  join(__dirname, "..", "..", "vscode-ui5-language-assistant");
const getBaseDes = () => join(__dirname, "..");

const srcReadme = join(getBaseSrc(), "README.md");
const destinationReadme = join(getBaseDes(), "README.md");
console.log(`Copying from ${srcReadme} to ${destinationReadme}`);
copySync(srcReadme, destinationReadme);
console.log("Copying finished successfully");

const vsixFiles = [];
readdirSync(getBaseSrc()).forEach((item) => {
  if (item.endsWith(".vsix")) {
    vsixFiles.push(item);
    return item;
  }
});
const vsixFile = vsixFiles.pop();
if (!vsixFile) {
  console.log(`There is not vsix under ${getBaseSrc()}`);
  return;
}
const srcVsix = join(getBaseSrc(), vsixFile);
const destinationVsix = join(getBaseDes(), vsixFile);
console.log(`Copying from ${srcVsix} to ${destinationVsix}`);
copySync(srcVsix, destinationVsix);
console.log("Copying finished successfully");
