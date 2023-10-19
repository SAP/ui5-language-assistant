import { join } from "path";
import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
  CURSOR_ANCHOR,
} from "@ui5-language-assistant/test-framework";
import { HoverService, getHoverService } from "../../helper";
import { initI18n } from "../../../../src/api";

describe("hover/index", () => {
  let getHover: HoverService;
  let framework: TestFramework;
  let root: string, documentPath: string;
  const viewFilePathSegments = [
    "app",
    "manage_travels",
    "webapp",
    "ext",
    "main",
    "Main.view.xml",
  ];
  beforeAll(async function () {
    const config: Config = {
      projectInfo: {
        name: ProjectName.cap,
        type: ProjectType.CAP,
        npmInstall: true,
        deleteBeforeCopy: false,
      },
    };
    framework = new TestFramework(config);
    const i18n = await framework.initI18n();
    initI18n(i18n);

    root = framework.getProjectRoot();
    documentPath = join(root, ...viewFilePathSegments);
    const uri = framework.getFileUri(viewFilePathSegments);
    getHover = getHoverService(
      framework,
      viewFilePathSegments,
      documentPath,
      uri
    );
  });
  describe("hover result", () => {
    it("on key", async () => {
      const snippet = `
        <Text text="{pa${CURSOR_ANCHOR}rts: ['some-value']}"></Text>
    `;
      const result = await getHover(snippet);
      expect(result).toMatchSnapshot();
    });
    it("on key - any type", async () => {
      const snippet = `
        <List
            items="{
                  path: '',
                  filters: [{
                      val${CURSOR_ANCHOR}ue1: ''
                  }]
              }"
        />
    `;
      const result = await getHover(snippet);
      expect(result).toMatchSnapshot();
    });
    it("on key inside collection", async () => {
      const snippet = `
        <Text text="{parts: ['some-test-data', { pa${CURSOR_ANCHOR}th: 'some-value'}]}"></Text>
    `;
      const result = await getHover(snippet);
      expect(result).toMatchSnapshot();
    });
    it("on key - inside structure", async () => {
      const snippet = `
      <List items="{
          path: '',
          filters: {
              pa${CURSOR_ANCHOR}th: ''
          }
      }" />
    `;
      const result = await getHover(snippet);
      expect(result).toMatchSnapshot();
    });
    it("on key - inside structure [reference]", async () => {
      const snippet = `
      <List items="{
          path: '',
          filters: {
              path: '',
              operator: 'All', 
              condition:{
                  filters: [{pa${CURSOR_ANCHOR}th: ''}]
              }
          }
      }" />
    `;
      const result = await getHover(snippet);
      expect(result).toMatchSnapshot();
    });
    it("on key - inside collection [filters]", async () => {
      const snippet = `
      <List items="{
          path: '',
          filters: [{
              pa${CURSOR_ANCHOR}th: ''
          }]
      }" />
    `;
      const result = await getHover(snippet);
      expect(result).toMatchSnapshot();
    });
    it("on key - inside collection [ nested filters]", async () => {
      const snippet = `
        <List
            items="{
                  path: '',
                  filters: [{
                      filters: [{
                        pa${CURSOR_ANCHOR}th: ''
                      }]
                  }]
              }"
        />
    `;
      const result = await getHover(snippet);
      expect(result).toMatchSnapshot();
    });
    it("on key - inside collection [ nested filters 02]", async () => {
      const snippet = `
        <List
            items="{
                  path: '',
                  filters: [{
                      filter${CURSOR_ANCHOR}s: [{
                      }]
                  }]
              }"
        />
    `;
      const result = await getHover(snippet);
      expect(result).toMatchSnapshot();
    });
    ["null", `''`, "0", "false"].forEach((value) => {
      it(`on key if ui5object has false value: ${value}`, async () => {
        const snippet = `
          <Text text="{ui5object: ${value}, pa${CURSOR_ANCHOR}th:'some-value' }" id="test-id"></Text>`;
        const result = await getHover(snippet);
        expect(result).toMatchSnapshot(value);
      });
    });
  });
  describe("no hover result", () => {
    it("check on value", async () => {
      const snippet = `
        <Text text="{parts: ['some${CURSOR_ANCHOR}-value']}"></Text>
    `;
      const result = await getHover(snippet);
      expect(result).toBeUndefined();
    });
    it("check on value inside collection", async () => {
      const snippet = `
        <Text text="{parts: ['some-test-data', { path: 'some-${CURSOR_ANCHOR}value'}]}"></Text>
    `;
      const result = await getHover(snippet);
      expect(result).toBeUndefined();
    });
    it("check on wrong key", async () => {
      const snippet = `
        <Text text="{par-${CURSOR_ANCHOR}ty: ['some-test-data', { path: 'some-value'}]}"></Text>
    `;
      const result = await getHover(snippet);
      expect(result).toBeUndefined();
    });
    it("check when property binding does not exits", async () => {
      const snippet = `
        <Text text="{par${CURSOR_ANCHOR}ty: ['some-test-data', { path: 'some-value'}]}"></Text>
    `;
      const result = await getHover(snippet, true);
      expect(result).toBeUndefined();
    });
    it("check not ui5 property", async () => {
      const snippet = `
        <List items="{inv${CURSOR_ANCHOR}oice>/Invoices}"> </List>
    `;
      const result = await getHover(snippet);
      expect(result).toBeUndefined();
    });
    it("check empty string", async () => {
      const snippet = `
        <Text text="${CURSOR_ANCHOR}"></Text>
     `;
      const result = await getHover(snippet);
      expect(result).toBeUndefined();
    });
    it("check binding expression", async () => {
      const snippet = `
        <Text text="{=  false ? 'Error' : 'Suc${CURSOR_ANCHOR}cess'}"></Text>
      `;
      const result = await getHover(snippet);
      expect(result).toBeUndefined();
    });
    it("check hover outside binding range", async () => {
      const snippet = `
        <Text text="{part: 'some-value'}, ${CURSOR_ANCHOR} {value: 'test-value'}"></Text>
     `;
      const result = await getHover(snippet);
      expect(result).toBeUndefined();
    });
    it("check binding is not allowed", async () => {
      const snippet = `
        <Text text="{i1${CURSOR_ANCHOR}8n>demo}"></Text>
     `;
      const result = await getHover(snippet);
      expect(result).toBeUndefined();
    });
    it("check exception", async () => {
      const snippet = `
        <Text text="{pa${CURSOR_ANCHOR}rts: ['some-value']}"></Text>
     `;
      const result = await getHover(snippet, false, true);
      expect(result).toBeUndefined();
    });
    it("on key if ui5object has truthy value", async () => {
      const snippet = `
          <Text text="{ui5object: true, pa${CURSOR_ANCHOR}th:'some-value' }" id="test-id"></Text>`;
      const result = await getHover(snippet, false, true);
      expect(result).toBeUndefined();
    });
  });
});
