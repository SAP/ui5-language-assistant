import { copySync, removeSync, pathExists, pathExistsSync } from "fs-extra";
import { execSync } from "child_process";
import { readdirSync } from "fs";
import { join } from "path";
import { print } from ".";

/**
 * Synchronously delete project folder
 *
 * @param destDir path to project directory
 */
export const deleteProject = (destDir: string): void => {
  try {
    print(`Deleting destination: ${destDir}`);
    removeSync(destDir);
    print(`Deletion finished`);
  } catch (error) {
    print(`Could not delete: ${destDir}`);
  }
};

/**
 * Get all contents of a project except `node_modules` and `package-lock.json`
 *
 * @param root root to a project
 */
export const getAllFileOrFolderPath = (root: string): string[] => {
  if (pathExistsSync(root)) {
    let fileOrFolder = readdirSync(root);
    fileOrFolder = fileOrFolder.filter((item) => {
      if (["node_modules", "package-lock.json"].includes(item)) {
        return false;
      }
      return true;
    });
    return fileOrFolder.map((item) => join(root, item));
  }
  return [];
};

/**
 * Remove all contents of a project except `node_modules` and `package-lock.json`
 */
export const removeProjectContent = (root: string): void => {
  const fileOrFolder = getAllFileOrFolderPath(root);
  for (let i = 0; i < fileOrFolder.length; i++) {
    removeSync(fileOrFolder[i]);
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
    print(`Could not copy to ${destDir}. Error: ${error + ""}`);
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
