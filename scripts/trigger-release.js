const { resolve } = require("path");
const { includes } = require("lodash");
const simpleGit = require("simple-git/promise");

const rootDir = resolve(__dirname, "..");
const git = simpleGit(rootDir);

/**
 * Github Releases are triggered when a new version (tag) of the VSCode extension
 * is pushed. **however** there seems to be a bug in either CircleCI or github.com
 * Which causes circleCI to **not** trigger tag builds when many tags are pushed at once.
 * Therefore we are manually deleting and re-pushing the VSCode extension tag
 */
async function triggerGHReleasesPublish() {
  const log = await git.log();
  const latestCommit = log.latest;
  const vscodeExtResult = /vscode-ui5-language-assistant@\d+(?:\.\d+)*/.exec(
    latestCommit.body
  );
  if (vscodeExtResult !== null) {
    const vscodeExtTag = vscodeExtResult[0];
    console.log(`deleting remote tag ${vscodeExtTag}`);
    await git.push(["--delete", "origin", vscodeExtTag]);
    console.log(`pushing tag ${vscodeExtTag}`);
    await git.push("origin", vscodeExtTag);
  }
}

/**
 * `lerna version` pushes a tag per each new package version.
 * However we need a single unique tag to trigger the `lerna publish --from-git` on circle-CI
 * This is why we delete and push the `RELEASE` as part of our release process.
 */
async function triggerNPMPublish() {
  const allTags = (await git.tags()).all;
  if (includes(allTags, "RELEASE")) {
    console.log("deleting old local<RELEASE> Tag");
    await git.tag(["-d", "RELEASE"]);
  }
  console.log("creating new local <RELEASE> Tag");
  await git.tag(["RELEASE"]);

  try {
    console.log("trying to delete old remote <RELEASE> Tag");
    await git.push(["--delete", "origin", "RELEASE"]);
  } catch (e) {
    console.log(e.message);
  }

  console.log("pushing new remote <RELEASE> Tag");
  await git.push("origin", "RELEASE");
}

async function main() {
  await triggerNPMPublish();
  // push tags slowly and one at a time to ensure CircleCi recognizes them.
  await new Promise(r => setTimeout(r, 1000));
  await triggerGHReleasesPublish();
}

main();
