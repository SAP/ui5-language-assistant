import { expect } from "chai";
import { join } from "path";
import { getManifestPath } from "../src/path";

describe("path", () => {
  context("getManifestPath", () => {
    it("will get path to manifest json file where there is a webapp folder", () => {
      const docPath = "c:/Users/someUser/project/webapp/ext/main/Main.view.xml";
      const result = getManifestPath(docPath);
      expect(result).to.equal(
        join("c:", "Users", "someUser", "project", "webapp", "manifest.json")
      );
    });
    it("will get 'webapp/manifest.json' as path because there is no webapp folder", () => {
      const docPath = "ext/main/Main.view.xml";
      const result = getManifestPath(docPath);
      expect(result).to.equal(join("webapp", "manifest.json"));
    });
  });
});
