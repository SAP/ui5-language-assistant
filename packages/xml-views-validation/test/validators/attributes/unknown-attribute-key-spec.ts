import { expect } from "chai";
import { DocumentCstNode, parse } from "@xml-tools/parser";
import { buildAst } from "@xml-tools/ast";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import {
  generateModel,
  expectExists,
} from "@ui5-language-assistant/test-utils";
import {
  computeExpectedRange,
  testValidationsScenario,
} from "../../test-utils";
import { validateUnknownAttributeKey } from "../../../src/validators/attributes/unknown-attribute-key";

describe("the unknown attribute name validation", () => {
  let ui5SemanticModel: UI5SemanticModel;

  before(async () => {
    ui5SemanticModel = await generateModel({ version: "1.74.0" });
  });

  context("true positive scenarios", () => {
    it("will detect an invalid attribute key in root class element", () => {
      const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m"
            🢂busy1🢀="true">
          </mvc:View>`;

      testValidationsScenario({
        model: ui5SemanticModel,
        xmlText: xmlSnippet,
        validators: {
          attribute: [validateUnknownAttributeKey],
        },
        assertion: (issues) => {
          expect(issues).to.deep.equal([
            {
              kind: "UnknownAttributeKey",
              message: "Unknown attribute key: busy1",
              offsetRange: computeExpectedRange(xmlSnippet),
              severity: "error",
            },
          ]);
        },
      });
    });

    it("will detect an invalid attribute key when the key starts with :", () => {
      const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m"
            🢂:busy🢀="true">
          </mvc:View>`;

      testValidationsScenario({
        model: ui5SemanticModel,
        xmlText: xmlSnippet,
        validators: {
          attribute: [validateUnknownAttributeKey],
        },
        assertion: (issues) => {
          expect(issues).to.deep.equal([
            {
              kind: "UnknownAttributeKey",
              message: "Unknown attribute key: :busy",
              offsetRange: computeExpectedRange(xmlSnippet),
              severity: "error",
            },
          ]);
        },
      });
    });

    it("will detect an invalid attribute key when the key ends with :", () => {
      const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m"
            🢂busy:🢀="true">
          </mvc:View>`;

      testValidationsScenario({
        model: ui5SemanticModel,
        xmlText: xmlSnippet,
        validators: {
          attribute: [validateUnknownAttributeKey],
        },
        assertion: (issues) => {
          expect(issues).to.deep.equal([
            {
              kind: "UnknownAttributeKey",
              message: "Unknown attribute key: busy:",
              offsetRange: computeExpectedRange(xmlSnippet),
              severity: "error",
            },
          ]);
        },
      });
    });

    it("will detect an invalid attribute key in non-root class element", () => {
      const xmlSnippet = `
        <mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.m">
          <content>
            <List 🢂unknownattribute🢀=""></List>
          </content>
        </mvc:View>`;

      testValidationsScenario({
        model: ui5SemanticModel,
        xmlText: xmlSnippet,
        validators: {
          attribute: [validateUnknownAttributeKey],
        },
        assertion: (issues) => {
          expect(issues).to.deep.equal([
            {
              kind: "UnknownAttributeKey",
              message: "Unknown attribute key: unknownattribute",
              offsetRange: computeExpectedRange(xmlSnippet),
              severity: "error",
            },
          ]);
        },
      });
    });

    it("will detect an invalid attribute key when the attribute doesn't have a value", () => {
      const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m"
            🢂busy1🢀 >
          </mvc:View>`;

      testValidationsScenario({
        model: ui5SemanticModel,
        xmlText: xmlSnippet,
        validators: {
          attribute: [validateUnknownAttributeKey],
        },
        assertion: (issues) => {
          expect(issues).to.deep.equal([
            {
              kind: "UnknownAttributeKey",
              message: "Unknown attribute key: busy1",
              offsetRange: computeExpectedRange(xmlSnippet),
              severity: "error",
            },
          ]);
        },
      });
    });

    it("will detect an invalid attribute key in aggregation element", () => {
      const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m">
            <content 🢂unknownattribute🢀="">
              <List></List>
            </content>
          </mvc:View>`;

      testValidationsScenario({
        model: ui5SemanticModel,
        xmlText: xmlSnippet,
        validators: {
          attribute: [validateUnknownAttributeKey],
        },
        assertion: (issues) => {
          expect(issues).to.deep.equal([
            {
              kind: "UnknownAttributeKey",
              message: "Unknown attribute key: unknownattribute",
              offsetRange: computeExpectedRange(xmlSnippet),
              severity: "error",
            },
          ]);
        },
      });
    });

    it("will detect an invalid xmlns attribute key element", () => {
      const xmlSnippet = `
                <mvc:View
                 xmlns:mvc="sap.ui.core.mvc"
                 🢂xmlns:m:1🢀="sap.m">
                </mvc:View>`;

      testValidationsScenario({
        model: ui5SemanticModel,
        xmlText: xmlSnippet,
        validators: {
          attribute: [validateUnknownAttributeKey],
        },
        assertion: (issues) => {
          expect(issues).to.deep.equal([
            {
              kind: "UnknownAttributeKey",
              message: "Unknown attribute key: xmlns:m:1",
              offsetRange: computeExpectedRange(xmlSnippet),
              severity: "error",
            },
          ]);
        },
      });
    });

    it("will detect 'stashed' as invalid in aggregation element", () => {
      const xmlSnippet = `
      <mvc:View
        xmlns:mvc="sap.ui.core.mvc"
        xmlns="sap.m">
        <content 🢂stashed🢀="">
          <List></List>
        </content>
      </mvc:View>`;

      testValidationsScenario({
        model: ui5SemanticModel,
        xmlText: xmlSnippet,
        validators: {
          attribute: [validateUnknownAttributeKey],
        },
        assertion: (issues) => {
          expect(issues).to.deep.equal([
            {
              kind: "UnknownAttributeKey",
              message: "Unknown attribute key: stashed",
              offsetRange: computeExpectedRange(xmlSnippet),
              severity: "error",
            },
          ]);
        },
      });
    });

    it("will detect 'binding' as invalid in aggregation element", () => {
      const xmlSnippet = `
      <mvc:View
        xmlns:mvc="sap.ui.core.mvc"
        xmlns="sap.m">
        <content 🢂binding🢀="">
          <List></List>
        </content>
      </mvc:View>`;

      testValidationsScenario({
        model: ui5SemanticModel,
        xmlText: xmlSnippet,
        validators: {
          attribute: [validateUnknownAttributeKey],
        },
        assertion: (issues) => {
          expect(issues).to.deep.equal([
            {
              kind: "UnknownAttributeKey",
              message: "Unknown attribute key: binding",
              offsetRange: computeExpectedRange(xmlSnippet),
              severity: "error",
            },
          ]);
        },
      });
    });

    it("will detect 'class' as invalid in aggregation element", () => {
      const xmlSnippet = `
      <mvc:View
        xmlns:mvc="sap.ui.core.mvc"
        xmlns="sap.m">
        <content 🢂class🢀="">
          <List></List>
        </content>
      </mvc:View>`;

      testValidationsScenario({
        model: ui5SemanticModel,
        xmlText: xmlSnippet,
        validators: {
          attribute: [validateUnknownAttributeKey],
        },
        assertion: (issues) => {
          expect(issues).to.deep.equal([
            {
              kind: "UnknownAttributeKey",
              message: "Unknown attribute key: class",
              offsetRange: computeExpectedRange(xmlSnippet),
              severity: "error",
            },
          ]);
        },
      });
    });

    it("will detect 'require' as invalid attribute when it's not in the core or template namespace", () => {
      const xmlSnippet = `
                <mvc:View
                  xmlns:mvc="sap.ui.core.mvc"
                  xmlns="sap.m"
                  🢂mvc:require🢀="">
                </mvc:View>`;

      testValidationsScenario({
        model: ui5SemanticModel,
        xmlText: xmlSnippet,
        validators: {
          attribute: [validateUnknownAttributeKey],
        },
        assertion: (issues) => {
          expect(issues).to.deep.equal([
            {
              kind: "UnknownAttributeKey",
              message: "Unknown attribute key: mvc:require",
              offsetRange: computeExpectedRange(xmlSnippet),
              severity: "error",
            },
          ]);
        },
      });
    });
  });

  context("negative edge cases", () => {
    context("class tag", () => {
      it("will not detect an issue when the attribute is a property", () => {
        const xmlSnippet = `
        <mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.m"
          busy="true">
        </mvc:View>`;

        testValidationsScenario({
          model: ui5SemanticModel,
          xmlText: xmlSnippet,
          validators: {
            attribute: [validateUnknownAttributeKey],
          },
          assertion: (issues) => {
            expect(issues).to.be.empty;
          },
        });
      });

      it("will not detect an issue when the attribute is an event", () => {
        const xmlSnippet = `
        <mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.m"
          afterInit="true">
        </mvc:View>`;

        testValidationsScenario({
          model: ui5SemanticModel,
          xmlText: xmlSnippet,
          validators: {
            attribute: [validateUnknownAttributeKey],
          },
          assertion: (issues) => {
            expect(issues).to.be.empty;
          },
        });
      });

      it("will not detect an issue when the attribute is an association", () => {
        const xmlSnippet = `
        <mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.m">
          <content>
            <m:List ariaLabelledBy="abc"></m:List>
          </content>
        </mvc:View>`;

        testValidationsScenario({
          model: ui5SemanticModel,
          xmlText: xmlSnippet,
          validators: {
            attribute: [validateUnknownAttributeKey],
          },
          assertion: (issues) => {
            expect(issues).to.be.empty;
          },
        });
      });

      it("will not detect an issue when the attribute is an aggrgation", () => {
        const xmlSnippet = `
        <mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns="sap.m"
          content="{model>elements}">
        </mvc:View>`;

        testValidationsScenario({
          model: ui5SemanticModel,
          xmlText: xmlSnippet,
          validators: {
            attribute: [validateUnknownAttributeKey],
          },
          assertion: (issues) => {
            expect(issues).to.be.empty;
          },
        });
      });

      context("special attributes", () => {
        it("will not detect an issue when the attribute is 'core:require'", () => {
          const xmlSnippet = `
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns:core="sap.ui.core"
              core:require="">
            </mvc:View>`;

          testValidationsScenario({
            model: ui5SemanticModel,
            xmlText: xmlSnippet,
            validators: {
              attribute: [validateUnknownAttributeKey],
            },
            assertion: (issues) => {
              expect(issues).to.be.empty;
            },
          });
        });

        it("will not detect an issue when the attribute is 'sap.ui.dt:designtime'", () => {
          const xmlSnippet = `
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns:dt="sap.ui.dt"
              dt:designtime="">
            </mvc:View>`;

          testValidationsScenario({
            model: ui5SemanticModel,
            xmlText: xmlSnippet,
            validators: {
              attribute: [validateUnknownAttributeKey],
            },
            assertion: (issues) => {
              expect(issues).to.be.empty;
            },
          });
        });

        it("will not detect an issue when the attribute is 'template:require'", () => {
          const xmlSnippet = `
              <mvc:View
                xmlns:mvc="sap.ui.core.mvc"
                xmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"
                template:require="">
              </mvc:View>`;

          testValidationsScenario({
            model: ui5SemanticModel,
            xmlText: xmlSnippet,
            validators: {
              attribute: [validateUnknownAttributeKey],
            },
            assertion: (issues) => {
              expect(issues).to.be.empty;
            },
          });
        });

        it("will not detect an issue when the attribute is 'binding'", () => {
          const xmlSnippet = `
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              binding="{}">
            </mvc:View>`;

          testValidationsScenario({
            model: ui5SemanticModel,
            xmlText: xmlSnippet,
            validators: {
              attribute: [validateUnknownAttributeKey],
            },
            assertion: (issues) => {
              expect(issues).to.be.empty;
            },
          });
        });

        it("will not detect an issue when the attribute is 'class'", () => {
          const xmlSnippet = `
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              class="small">
            </mvc:View>`;

          testValidationsScenario({
            model: ui5SemanticModel,
            xmlText: xmlSnippet,
            validators: {
              attribute: [validateUnknownAttributeKey],
            },
            assertion: (issues) => {
              expect(issues).to.be.empty;
            },
          });
        });

        it("will not detect an issue when the attribute namespace is custom data", () => {
          const xmlSnippet = `
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns:custom="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
              custom:unknownattr="">
            </mvc:View>`;

          testValidationsScenario({
            model: ui5SemanticModel,
            xmlText: xmlSnippet,
            validators: {
              attribute: [validateUnknownAttributeKey],
            },
            assertion: (issues) => {
              expect(issues).to.be.empty;
            },
          });
        });

        it("will not detect an issue when the attribute is 'stashed' on sap.uxap.ObjectPageLazyLoader", () => {
          const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns:uxap="sap.uxap">
            <content>
            <uxap:ObjectPageLazyLoader stashed="true"></uxap:ObjectPageLazyLoader>
            </content>
          </mvc:View>`;

          testValidationsScenario({
            model: ui5SemanticModel,
            xmlText: xmlSnippet,
            validators: {
              attribute: [validateUnknownAttributeKey],
            },
            assertion: (issues) => {
              expect(issues).to.be.empty;
            },
          });
        });

        it("will not detect an issue when the attribute is xmlns (default)", () => {
          const xmlSnippet = `
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc">
              <content>
                <List xmlns="sap.m"></List>
              </content>
            </mvc:View>`;

          testValidationsScenario({
            model: ui5SemanticModel,
            xmlText: xmlSnippet,
            validators: {
              attribute: [validateUnknownAttributeKey],
            },
            assertion: (issues) => {
              expect(issues).to.be.empty;
            },
          });
        });

        it("will not detect an issue when the attribute is xmlns (with name)", () => {
          const xmlSnippet = `
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc"">
              <content>
                <m:List xmlns:m="sap.m"></m:List>
              </content>
            </mvc:View>`;

          testValidationsScenario({
            model: ui5SemanticModel,
            xmlText: xmlSnippet,
            validators: {
              attribute: [validateUnknownAttributeKey],
            },
            assertion: (issues) => {
              expect(issues).to.be.empty;
            },
          });
        });
      });
    });

    context("aggregation tag", () => {
      it("will not detect an issue when the attribute is 'core:require'", () => {
        const xmlSnippet = `
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns:core="sap.ui.core">
              <content core:require="">
              </content>
            </mvc:View>`;

        testValidationsScenario({
          model: ui5SemanticModel,
          xmlText: xmlSnippet,
          validators: {
            attribute: [validateUnknownAttributeKey],
          },
          assertion: (issues) => {
            expect(issues).to.be.empty;
          },
        });
      });

      it("will not detect an issue when the attribute is 'sap.ui.dt:designtime'", () => {
        const xmlSnippet = `
        <mvc:View
          xmlns:mvc="sap.ui.core.mvc"
          xmlns:dt="sap.ui.dt">
          <content dt:designtime=""></content>
        </mvc:View>`;

        testValidationsScenario({
          model: ui5SemanticModel,
          xmlText: xmlSnippet,
          validators: {
            attribute: [validateUnknownAttributeKey],
          },
          assertion: (issues) => {
            expect(issues).to.be.empty;
          },
        });
      });

      it("will not detect an issue when the attribute is 'template:require'", () => {
        const xmlSnippet = `
              <mvc:View
                xmlns:mvc="sap.ui.core.mvc"
                xmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1">
                <content template:require=""></content>
              </mvc:View>`;

        testValidationsScenario({
          model: ui5SemanticModel,
          xmlText: xmlSnippet,
          validators: {
            attribute: [validateUnknownAttributeKey],
          },
          assertion: (issues) => {
            expect(issues).to.be.empty;
          },
        });
      });

      it("will not detect an issue when the attribute namespace is custom data", () => {
        const xmlSnippet = `
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              xmlns:custom="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1">
              <content custom:unknownattr=""></content>
            </mvc:View>`;

        testValidationsScenario({
          model: ui5SemanticModel,
          xmlText: xmlSnippet,
          validators: {
            attribute: [validateUnknownAttributeKey],
          },
          assertion: (issues) => {
            expect(issues).to.be.empty;
          },
        });
      });

      it("will not detect an issue when the attribute is xmlns (default)", () => {
        const xmlSnippet = `
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc"">
              <content xmlns="sap.m">
              </content>
            </mvc:View>`;

        testValidationsScenario({
          model: ui5SemanticModel,
          xmlText: xmlSnippet,
          validators: {
            attribute: [validateUnknownAttributeKey],
          },
          assertion: (issues) => {
            expect(issues).to.be.empty;
          },
        });
      });

      it("will not detect an issue when the attribute is xmlns (with name)", () => {
        const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"">
            <content xmlns:m="sap.m">
            </content>
          </mvc:View>`;

        testValidationsScenario({
          model: ui5SemanticModel,
          xmlText: xmlSnippet,
          validators: {
            attribute: [validateUnknownAttributeKey],
          },
          assertion: (issues) => {
            expect(issues).to.be.empty;
          },
        });
      });
    });

    context("unknown tag", () => {
      it("will not detect an issue when the attribute name is unknown for tag starting with lowecase", () => {
        const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m">
            <content1 unknownattribute="">
            </content1>
          </mvc:View>`;

        testValidationsScenario({
          model: ui5SemanticModel,
          xmlText: xmlSnippet,
          validators: {
            attribute: [validateUnknownAttributeKey],
          },
          assertion: (issues) => {
            expect(issues).to.be.empty;
          },
        });
      });

      it("will not detect an issue when the attribute name is unknown for tag starting with uppercase", () => {
        const xmlSnippet = `
          <mvc:View
            xmlns:mvc="sap.ui.core.mvc">
            <content>
              <List unknownattribute=""></List>
            </content>
          </mvc:View>`;

        testValidationsScenario({
          model: ui5SemanticModel,
          xmlText: xmlSnippet,
          validators: {
            attribute: [validateUnknownAttributeKey],
          },
          assertion: (issues) => {
            expect(issues).to.be.empty;
          },
        });
      });

      it("will not detect an issue when the attribute name is unknown for tag in known namespace", () => {
        const xmlSnippet = `
          <mvc:View1
            xmlns:mvc="sap.ui.core.mvc"
            xmlns="sap.m"
            busy1="true">
          </mvc:View1>`;

        testValidationsScenario({
          model: ui5SemanticModel,
          xmlText: xmlSnippet,
          validators: {
            attribute: [validateUnknownAttributeKey],
          },
          assertion: (issues) => {
            expect(issues).to.be.empty;
          },
        });
      });
    });

    context("non-reproducible unit tests", () => {
      it("will not detect an issue when the attribute doesn't have a key", () => {
        const xmlSnippet = `
            <mvc:View
              xmlns:mvc="sap.ui.core.mvc"
              attr="">
            </mvc:View>`;

        const { cst, tokenVector } = parse(xmlSnippet);
        const ast = buildAst(cst as DocumentCstNode, tokenVector);
        const attr = ast.rootElement?.attributes[0];
        expectExists(attr, "attr");
        const attrWithoutKey = {
          ...attr,
          key: null,
        };
        const issues = validateUnknownAttributeKey(
          attrWithoutKey,
          ui5SemanticModel
        );
        expect(issues).to.be.empty;
      });
    });
  });
});
