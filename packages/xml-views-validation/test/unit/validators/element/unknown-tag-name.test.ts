import { validators } from "../../../../src/api";
import {
  Config,
  ProjectName,
  ProjectType,
  TestFramework,
} from "@ui5-language-assistant/test-framework";
import { GetViewValidator, getViewValidator } from "../../helper";

describe("the unknown tag name validation", () => {
  let framework: TestFramework;
  let validateView: GetViewValidator;
  const viewFilePathSegments = [
    "app",
    "manage_travels",
    "webapp",
    "ext",
    "main",
    "Main.view.xml",
  ];
  beforeAll(async () => {
    const config: Config = {
      projectInfo: {
        name: ProjectName.cap,
        type: ProjectType.CAP,
        npmInstall: false,
        deleteBeforeCopy: false,
      },
    };
    framework = new TestFramework(config);
    validateView = getViewValidator(framework, viewFilePathSegments, {
      attribute: [],
      document: [],
      element: [validators.validateUnknownTagName],
    });
  });

  describe("true positive scenarios", () => {
    describe("tag with namespace", () => {
      it("will detect an invalid class name in root tag", async () => {
        const snippet = `
        <mvc:View_TYPO
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.m">
        </mvc:View_TYPO>
        `;
        const result = await validateView(snippet);
        expect(result).toMatchSnapshot();
      });

      it("will detect an invalid class name under class that has default aggregation", async () => {
        const snippet = `
          <mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns:m="sap.m"
          >
              <m:Button_TYPO />
          </mvc:View>
        `;
        const result = await validateView(snippet);
        expect(result).toMatchSnapshot();
      });

      it("will detect an invalid class name under class that doesn't have a default aggregation", async () => {
        const snippet = `
          <mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns:m="sap.m"
          >
              <m:SplitApp>
                  <m:Button_TYPO />
              </m:SplitApp>
          </mvc:View>
        `;
        const result = await validateView(snippet);
        expect(result).toMatchSnapshot();
      });

      it("will detect an invalid class name under aggregation", async () => {
        const snippet = `
            <mvc:View
                xmlns:mvc="sap.ui.core.mvc"
                xmlns:m="sap.m"
            >
                <mvc:content>
                    <m:Button_TYPO />
                </mvc:content>
            </mvc:View>
        `;
        const result = await validateView(snippet);
        expect(result).toMatchSnapshot();
      });

      it("will detect an invalid aggregation when it's in the wrong namespace", async () => {
        const snippet = `
            <mvc:View
                xmlns:mvc="sap.ui.core.mvc"
                xmlns:m="sap.m"
            >
                <m:content />
            </mvc:View>
        `;
        const result = await validateView(snippet);
        expect(result).toMatchSnapshot();
      });

      it("will detect an invalid class name under aggregation in the same namespace", async () => {
        const snippet = `
          <mvc:View xmlns:mvc="sap.ui.core.mvc">
              <mvc:content>
                  <mvc:Button_TYPO />
              </mvc:content>
          </mvc:View>
        `;
        const result = await validateView(snippet);
        expect(result).toMatchSnapshot();
      });

      it("will detect an invalid aggregation name under known class tag without default aggregation", async () => {
        const snippet = `
            <mvc:View
                xmlns:mvc="sap.ui.core.mvc"
                xmlns:m="sap.m"
            >
                <m:SplitApp>
                    <m:content_TYPO />
                </m:SplitApp>
            </mvc:View>
        `;
        const result = await validateView(snippet);
        expect(result).toMatchSnapshot();
      });

      it("will detect an issue for unknown name under unknown class in a known namespace", async () => {
        const snippet = `
          <mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns:m="sap.m"
          >
              <m:SplitApp_TYPO>
                  <m:Button_TYPO />
              </m:SplitApp_TYPO>
          </mvc:View>
        `;
        const result = await validateView(snippet);
        expect(result).toMatchSnapshot();
      });
    });

    describe("tag without namespace", () => {
      describe("when default namespace is not defined", () => {
        it("will detect an invalid class name in root tag", async () => {
          const snippet = `
            <View>
            </View>
          `;
          const result = await validateView(snippet);
          expect(result).toMatchSnapshot();
        });

        it("will detect an invalid class name under known aggregation tag", async () => {
          const snippet = `
            <mvc:View xmlns:mvc="sap.ui.core.mvc">
                <mvc:content>
                    <List />
                </mvc:content>
            </mvc:View>
          `;
          const result = await validateView(snippet);
          expect(result).toMatchSnapshot();
        });

        it("will detect an invalid class or aggregation name under known class tag with default aggregation", async () => {
          const snippet = `
            <mvc:View xmlns:mvc="sap.ui.core.mvc">
                <List />
            </mvc:View>
          `;
          const result = await validateView(snippet);
          expect(result).toMatchSnapshot();
        });

        it("will detect an invalid aggregation namespace under known class tag without default aggregation", async () => {
          const snippet = `
            <mvc:View
                xmlns:mvc="sap.ui.core.mvc"
                xmlns:m="sap.m"
            >
                <m:SplitApp>
                    <content />
                </m:SplitApp>
            </mvc:View>
          `;
          const result = await validateView(snippet);
          expect(result).toMatchSnapshot();
        });

        it("will detect an issue for unknown name under unknown class in non-default non-ui5 namespace when name starts with uppercase", async () => {
          const snippet = `
            <mvc:View
                xmlns:mvc="sap.ui.core.mvc"
                xmlns:typo="sap.m_TYPO"
            >
                <typo:SplitApp>
                    <Button_TYPO />
                </typo:SplitApp>
            </mvc:View>`;
          const result = await validateView(snippet);
          expect(result).toMatchSnapshot();
        });
      });

      describe("when default namespace is a ui5 namespace", () => {
        it("will detect an issue for unknown name under unknown class in the default namespace", async () => {
          const snippet = `
            <mvc:View
                xmlns:mvc="sap.ui.core.mvc"
                xmlns="sap.m"
            >
                <SplitApp_TYPO>
                    <Button_TYPO />
                </SplitApp_TYPO>
            </mvc:View>
          `;
          const result = await validateView(snippet);
          expect(result).toMatchSnapshot();
        });
      });
    });

    describe("when default namespace is a ui5 namespace", () => {
      it("will detect an invalid class name in root tag", async () => {
        const snippet = `<View_TYPO xmlns="sap.ui.core.mvc" />`;
        const result = await validateView(snippet);
        expect(result).toMatchSnapshot();
      });

      it("will detect an invalid class name under known aggregation tag", async () => {
        const snippet = `
                <View xmlns="sap.ui.core.mvc">
                    <content>
                        <List_TYPO />
                    </content>
                </View>
              `;
        const result = await validateView(snippet);
        expect(result).toMatchSnapshot();
      });

      it("will detect an invalid class or aggregation name under known class tag with default aggregation", async () => {
        const snippet = `
            <View xmlns="sap.ui.core.mvc">
                <List_TYPO />
            </View>
        `;
        const result = await validateView(snippet);
        expect(result).toMatchSnapshot();
      });

      it("will detect an invalid aggregation name under known class tag without default aggregation", async () => {
        const snippet = `
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m"
          >
              <SplitApp>
                  <content_TYPO />
              </SplitApp>
          </mvc:View>`;
        const result = await validateView(snippet);
        expect(result).toMatchSnapshot();
      });
    });
  });

  describe("negative edge cases", () => {
    describe("tag with namespace", () => {
      describe("non-ui5 namespace", () => {
        it("will not detect an issue when namespace is unknown", async () => {
          const snippet = `
              <mvc:View_TYPO
                  xmlns:mvc="sap.ui.core.mvc_TYPO"
                  xmlns="sap.m"
              />`;
          const result = await validateView(snippet);
          expect(result).toStrictEqual([]);
        });

        it("will not detect an issue when namespace is xhtml", async () => {
          const snippet = `
            <mvc:View_TYPO
              xmlns:mvc="http://www.w3.org/1999/xhtml"
              xmlns="sap.m">
            </mvc:View_TYPO>
          `;
          const result = await validateView(snippet);
          expect(result).toStrictEqual([]);
        });

        it("will not detect an issue when namespace is not defined in xmlns attribute", async () => {
          const snippet = `
              <mvc:View_TYPO
                xmlns="sap.m">
              </mvc:View_TYPO>
          `;
          const result = await validateView(snippet);
          expect(result).toStrictEqual([]);
        });
      });

      describe("ui5 namespace", () => {
        it("will not detect an issue for known class in the root tag", async () => {
          const snippet = `
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m">
            </mvc:View>
          `;
          const result = await validateView(snippet);
          expect(result).toStrictEqual([]);
        });

        it("will not detect an issue for sap.ui.core.FragmentDefinition in the root tag", async () => {
          const snippet = `
              <core:FragmentDefinition
                  xmlns="sap.m"
                  xmlns:core="sap.ui.core"
              >
                  <Label text="These controls are within one multi-root Fragment:" />
                  <Input />
                  <Button text="Still in the same Fragment" />
              </core:FragmentDefinition>
          `;
          const result = await validateView(snippet);
          expect(result).toStrictEqual([]);
        });

        it("will not detect an issue for known aggregation in a different namespace prefix that references the same namespace", async () => {
          const snippet = `<mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns:mvc2="sap.ui.core.mvc">
              <mvc2:content>
              </mvc2:content>
            </mvc:View>`;
          const result = await validateView(snippet);
          expect(result).toStrictEqual([]);
        });

        it("will not detect an issue for known class under class that has default aggregation", async () => {
          const snippet = `<mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns:m="sap.m">
              <m:Button>
              </m:Button>
            </mvc:View>`;
          const result = await validateView(snippet);
          expect(result).toStrictEqual([]);
        });

        it("will not detect an issue for known class under class that doesn't have a default aggregation", async () => {
          const snippet = `<mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns:m="sap.m">
              <m:SplitApp>
                <m:Button>
                </m:Button>
              </m:SplitApp>
            </mvc:View>`;
          const result = await validateView(snippet);
          expect(result).toStrictEqual([]);
        });

        it("will not detect an issue for known class under aggregation", async () => {
          const snippet = `<mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns:m="sap.m">
              <mvc:content>
                <m:Button>
                </m:Button>
              </mvc:content>
            </mvc:View>`;
          const result = await validateView(snippet);
          expect(result).toStrictEqual([]);
        });

        it("will not detect an issue for known class under tag in unknown namespace", async () => {
          const snippet = `<mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns:m="sap.m"
              xmlns:customns="customns">
              <customns:SplitApp>
                <m:Button>
                </m:Button>
              </customns:SplitApp>
            </mvc:View>`;
          const result = await validateView(snippet);
          expect(result).toStrictEqual([]);
        });

        it("will not detect an issue for known class under tag in unknown default namespace", async () => {
          const snippet = `<mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns:m="sap.m"
              xmlns="customns">
              <SplitApp>
                <m:Button>
                </m:Button>
              </SplitApp>
            </mvc:View>`;
          const result = await validateView(snippet);
          expect(result).toStrictEqual([]);
        });

        it("will not detect an issue for sap.ui.core.ExtensionPoint as top level element in sap.ui.core.mvc.View", async () => {
          const snippet = `<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core">
                <core:ExtensionPoint name="extension1"/>
            </mvc:View>`;
          const result = await validateView(snippet);
          expect(result).toStrictEqual([]);
        });

        it("will not detect an issue for sap.ui.core.ExtensionPoint as top level element in sap.ui.core.Fragment", async () => {
          const snippet = `<FragmentDefinition xmlns="sap.ui.core">
                <ExtensionPoint name="extension1"/>
            </FragmentDefinition>`;
          const result = await validateView(snippet);
          expect(result).toStrictEqual([]);
        });

        it("will not detect an issue for sap.ui.core.ExtensionPoint as nested element in sap.ui.core.mvc.View", async () => {
          const snippet = `<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core" xmlns:m="sap.m">
                <m:Page>
                  <m:content>
                    <core:ExtensionPoint name="extension1"/>
                  </m:content>
                </m:Page>
            </mvc:View>`;
          const result = await validateView(snippet);
          expect(result).toStrictEqual([]);
        });

        it("will not detect an issue for sap.ui.core.ExtensionPoint as nested element in sap.ui.core.Fragment", async () => {
          const snippet = `<FragmentDefinition xmlns="sap.ui.core">
              <m:Panel>
                <m:content>
                  <core:ExtensionPoint name="extension1"/>
                </m:content>
              </m:Panel>
            </FragmentDefinition>`;
          const result = await validateView(snippet);
          expect(result).toStrictEqual([]);
        });

        it("will not detect an issue for typedefs as element [macrosTable:Action]", async () => {
          const snippet = `<mvc:View
                xmlns:macrosTable="sap.fe.macros.table"
              >
              <macrosTable:Action
                  key="customAction"
                  text="My Custom Action"
              />
            </mvc:View>`;
          const result = await validateView(snippet);
          expect(result).toStrictEqual([]);
        });
        it("will detect an issue for sap.ui.core.ExtensionPoint in the root tag", async () => {
          const snippet = `<🢂ExtensionPoint🢀 name="extension1"></ExtensionPoint>`;
          const result = await validateView(snippet);
          expect(result).toMatchSnapshot();
        });
      });
    });

    describe("tag without namespace", () => {
      describe("when default namespace is a ui5 namespace", () => {
        it("will not detect an issue for known class in the root tag", async () => {
          const snippet = `<View
              xmlns="sap.ui.core.mvc">
            </View>`;
          const result = await validateView(snippet);
          expect(result).toStrictEqual([]);
        });

        it("will not detect an issue for sap.ui.core.FragmentDefinition in the root tag", async () => {
          const snippet = `<FragmentDefinition xmlns:m="sap.m" xmlns="sap.ui.core">
                <m:Label text="These controls are within one multi-root Fragment:" />
                <m:Input />
                <m:Button text="Still in the same Fragment" />
            </FragmentDefinition>`;
          const result = await validateView(snippet);
          expect(result).toStrictEqual([]);
        });

        it("will not detect an issue for known class under known aggregation tag", async () => {
          const snippet = `<mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m">
              <mvc:content>
                <Button>
                </Button>
              </mvc:content>
            </mvc:View>`;
          const result = await validateView(snippet);
          expect(result).toStrictEqual([]);
        });

        it("will not detect an issue for known class under known class tag with default aggregation", async () => {
          const snippet = `<mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m">
              <Button>
              </Button>
            </mvc:View>`;
          const result = await validateView(snippet);
          expect(result).toStrictEqual([]);
        });

        it("will not detect an issue for known class under known class tag without default aggregation", async () => {
          // This should be detected in a different validation
          const snippet = `<mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m">
              <SplitApp>
                <Button>
                </Button>
              </SplitApp>
            </mvc:View>`;
          const result = await validateView(snippet);
          expect(result).toStrictEqual([]);
        });

        it("will not detect an issue for known aggregation under known class tag with default aggregation", async () => {
          const snippet = `<mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m">
              <mvc:content>
              </mvc:content>
            </mvc:View>`;
          const result = await validateView(snippet);
          expect(result).toStrictEqual([]);
        });

        it("will not detect an issue for known aggregation under known class tag without default aggregation", async () => {
          const snippet = `<mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m">
              <SplitApp>
                <masterPages>
                </masterPages>
              </SplitApp>
            </mvc:View>`;
          const result = await validateView(snippet);
          expect(result).toStrictEqual([]);
        });

        it("will not detect an issue for known class under tag in unknown namespace", async () => {
          const snippet = `<mvc:View
              xmlns:mvc="sap.ui.core.mvc_TYPO"
              xmlns="sap.m">
              <SplitApp>
              </SplitApp>
            </mvc:View>`;
          const result = await validateView(snippet);
          expect(result).toStrictEqual([]);
        });

        it("will not detect an issue for unknown name under unknown class in non-ui5 namespace", async () => {
          const snippet = `<mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns:typo="sap.m_TYPO"
              xmlns="sap.m">
              <typo:SplitApp>
                <typo:content_TYPO>
                </typo:content_TYPO>
              </typo:SplitApp>
            </mvc:View>`;
          const result = await validateView(snippet);
          expect(result).toStrictEqual([]);
        });
      });

      describe("when default namespace is a non-ui5 namespace", () => {
        it("will not detect an issue for unknown name in root tag", async () => {
          const snippet = `<View_TYPO
              xmlns="sap.ui.core.mvc_TYPO">
            </View_TYPO>`;
          const result = await validateView(snippet);
          expect(result).toStrictEqual([]);
        });

        it("will not detect an issue for unknown name under known aggregation tag", async () => {
          const snippet = `<mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m_TYPO">
              <mvc:content>
                <Button_TYPO>
                </Button_TYPO>
              </mvc:content>
            </mvc:View>`;
          const result = await validateView(snippet);
          expect(result).toStrictEqual([]);
        });

        it("will not detect an issue for unknown name under known class tag with default aggregation", async () => {
          const snippet = `<mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m_TYPO">
              <Button_TYPO>
              </Button_TYPO>
            </mvc:View>`;
          const result = await validateView(snippet);
          expect(result).toStrictEqual([]);
        });

        it("will not detect an issue for unknown name under known class tag without default aggregation", async () => {
          // The tag might still be allowed if it's not a class, e.g. template tags are allowed everywhere
          const snippet = `<mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns:m="sap.m"
              xmlns="sap.m_TYPO">
              <m:SplitApp>
                <Button_TYPO>
                </Button_TYPO>
              </m:SplitApp>
            </mvc:View>`;
          const result = await validateView(snippet);
          expect(result).toStrictEqual([]);
        });

        it("will not detect an issue for unknown name under unknown class in default non-ui5 namespace when name starts with lowercase", async () => {
          const snippet = `<mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m_TYPO">
              <SplitApp>
                <content_TYPO>
                </content_TYPO>
              </SplitApp>
            </mvc:View>`;
          const result = await validateView(snippet);
          expect(result).toStrictEqual([]);
        });

        it("will not detect an issue for unknown name under unknown class in default non-ui5 namespace when name starts with uppercase", async () => {
          const snippet = `<mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.m_TYPO">
              <SplitApp>
                <Button_TYPO>
                </Button_TYPO>
              </SplitApp>
            </mvc:View>`;
          const result = await validateView(snippet);
          expect(result).toStrictEqual([]);
        });
      });

      describe("when default namespace is not defined", () => {
        it("will not detect an issue for tag without a name", async () => {
          const snippet = `< >
            </View>`;
          const result = await validateView(snippet);
          expect(result).toStrictEqual([]);
        });

        it("will not detect an issue for unknown name under unknown class in non-default non-ui5 namespace when name starts with lowercase", async () => {
          const snippet = `<mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns:typo="sap.m_TYPO">
              <typo:SplitApp>
                <typo:content_TYPO>
                </typo:content_TYPO>
              </typo:SplitApp>
            </mvc:View>`;
          const result = await validateView(snippet);
          expect(result).toStrictEqual([]);
        });
      });
    });
  });
});
