import { copySync, removeSync, pathExists, pathExistsSync } from "fs-extra";
import { spawnSync } from "child_process";
import { print } from ".";

/**
 * Synchronously delete project-copy folder
 *
 */
export const deleteCopy = (srcDir: string): void => {
  const destDir = `${srcDir}-copy`;
  try {
    print(`Deleting destination: ${destDir}`);
    removeSync(destDir);
    print(`Deletion finished`);
  } catch (error) {
    print(`Could not delete: ${destDir}`);
  }
};

/**
 * Synchronously create a copy of project
 *
 */
export const createCopy = (srcDir: string): void => {
  const destDir = `${srcDir}-copy`;
  try {
    print(`Copying to destination: ${destDir}`);
    copySync(srcDir, destDir, { overwrite: true, recursive: true });
    print(`Copying finished`);
  } catch (error) {
    print(`Could not copy to ${destDir}`);
  }
};

export const npmInstall = (projectPath: string): void => {
  print(`Installing packages in ${projectPath}. Max time allocated is 5 min.`);
  const npm = spawnSync(`npm`, ["install", "--ignore-engines"], {
    cwd: projectPath,
    env: process.env,
    shell: true,
    stdio: ["pipe", "pipe", "pipe"],
    timeout: 5 * 60000, // 5 min
  });
  if (npm.status && npm.status !== 0) {
    const errorText = npm.stderr.toString();
    throw new Error(errorText);
  }
  print(`Installation finished in ${projectPath}`);
};

export const fileExits = (filePath: string): Promise<boolean> => {
  return pathExists(filePath);
};
export const fileExitsSync = (filePath: string): boolean => {
  return pathExistsSync(filePath);
};
