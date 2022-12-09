export const print = (text: string): void => {
  process.stdout.write(`${text}\n`);
};

export {
  deleteProject,
  createCopy,
  npmInstall,
  fileExits,
  fileExitsSync,
  removeProjectContent,
} from "./project";
