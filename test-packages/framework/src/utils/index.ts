export const print = (text: string): void => {
  process.stdout.write(`${text}\n`);
};

export {
  deleteCopy,
  createCopy,
  npmInstall,
  fileExits,
  fileExitsSync,
  removeProjectContent,
} from "./project";
