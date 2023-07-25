import { readFile } from "fs/promises";
import { join } from "path";

interface PackageJson {
  contributes: {
    semanticTokenScopes: {
      language: string;
      scopes: Record<string, string[]>;
    }[];
  };
}
describe("package.json", () => {
  let packageJson: PackageJson;
  beforeAll(async () => {
    const fileUri = join(__dirname, "..", "..", "package.json");
    const fileContent = await readFile(fileUri, "utf-8");
    packageJson = JSON.parse(fileContent);
  });
  describe("contributes", () => {
    it("check semanticTokenScopes", () => {
      expect(packageJson.contributes.semanticTokenScopes).toMatchSnapshot();
    });
  });
});
