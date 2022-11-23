import { copySync, removeSync, pathExists, pathExistsSync } from "fs-extra";
import { execSync } from "child_process";
import { print } from ".";

/**
 * Synchronously delete project-copy folder
 *
 * @param srcDir path to source directory
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
 * @param srcDir path to source directory
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

/**
 * Synchronously perform npm install
 *
 * @param projectPath path to a project where package.json file is located
 */
export const npmInstall = (projectPath: string): void => {
  print(`Installing packages in ${projectPath}. Max time allocated is 5 min.`);
  try {
    execSync("npm install --ignore-engines", {
      cwd: projectPath,
      env: process.env,
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 5 * 60000, // 5 min
    });
  } catch (error) {
    print(`Installation failed in ${projectPath}`);
    throw error;
  }
  print(`Installation finished in ${projectPath}`);
};
/**
 * Check if a file exits
 *
 * @param filePath path to a file on a system
 */
export const fileExits = (filePath: string): Promise<boolean> => {
  return pathExists(filePath);
};
/**
 * Synchronously check if a file exits
 *
 * @param filePath path to a file on a system
 */
export const fileExitsSync = (filePath: string): boolean => {
  return pathExistsSync(filePath);
};
