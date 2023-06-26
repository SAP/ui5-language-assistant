import {
  resolveXMLNS,
  resolveXMLNSFromPrefix,
  isSameXMLNS,
  isSameXMLNSFromPrefix,
} from "../../src/api";
import { XMLElement, buildAst } from "@xml-tools/ast";
import { parse, DocumentCstNode } from "@xml-tools/parser";
import { expectExists } from "@ui5-language-assistant/test-utils";

describe("The @ui5-language-assistant/logic-utils <resolveXMLNSFromPrefix> function", () => {
  describe("prefix exists", () => {
    it("returns the namespace for defined prefix", () => {
      const rootElement = getRootElement(
        `<x:b xmlns:a="a.ns" xmlns:x="x.ns"></x:b>`
      );
      expect(resolveXMLNSFromPrefix("a", rootElement)).toEqual("a.ns");
    });

    it("returns the correct namespace when it's redefined", () => {
      const rootElement = getRootElement(`
        <a:b xmlns:a="a.ns" xmlns="default.ns">
          <a:c xmlns:a="redefined.a"/>
        </a:b>`);
      expect(rootElement.subElements[0]).not.toBeUndefined();
      expect(resolveXMLNSFromPrefix("a", rootElement.subElements[0])).toEqual(
        "redefined.a"
      );
    });
  });

  describe("prefix is not sent", () => {
    it("returns the default namespace when it's defined", () => {
      const rootElement = getRootElement(
        `<a:b xmlns:a="a.ns" xmlns="default.ns"></a:b>`
      );
      expect(resolveXMLNSFromPrefix(undefined, rootElement)).toEqual(
        "default.ns"
      );
    });

    it("returns undefined when the default namespace is not defined", () => {
      const rootElement = getRootElement(`<a:b xmlns:a="a.ns"></a:b>`);
      expect(resolveXMLNSFromPrefix(undefined, rootElement)).toBeUndefined();
    });
  });

  describe("prefix is not defined", () => {
    it("returns undefined", () => {
      const rootElement = getRootElement(`<a:b xmlns:a="a.ns"></a:b>`);
      expect(resolveXMLNSFromPrefix("x", rootElement)).toBeUndefined();
    });

    it("returns undefined when there is a default namespace", () => {
      const rootElement = getRootElement(
        `<a:b xmlns:a="a.ns" xmlns="default.ns"></a:b>`
      );
      expect(resolveXMLNSFromPrefix("x", rootElement)).toBeUndefined();
    });
  });
});

describe("The @ui5-language-assistant/logic-utils <resolveXMLNS> function", () => {
  describe("element prefix exists", () => {
    it("returns the namespace for defined prefix", () => {
      const rootElement = getRootElement(`<a:b xmlns:a="a.ns"></a:b>`);
      expect(resolveXMLNS(rootElement)).toEqual("a.ns");
    });

    it("returns the correct namespace when it's redefined", () => {
      const rootElement = getRootElement(`
        <a:b xmlns:a="a.ns" xmlns="default.ns">
          <a:c xmlns:a="redefined.a"/>
        </a:b>`);
      expect(rootElement.subElements[0]).not.toBeUndefined();
      expect(resolveXMLNS(rootElement.subElements[0])).toEqual("redefined.a");
    });
  });

  describe("element doesn't have a prefix", () => {
    it("returns the default namespace when it's defined", () => {
      const rootElement = getRootElement(`<b xmlns="default.ns"></b>`);
      expect(resolveXMLNS(rootElement)).toEqual("default.ns");
    });

    it("returns undefined when the default namespace is not defined", () => {
      const rootElement = getRootElement(`<b></b>`);
      expect(resolveXMLNS(rootElement)).toBeUndefined();
    });
  });

  describe("element prefix is not defined", () => {
    it("returns undefined", () => {
      const rootElement = getRootElement(`<x:b xmlns:a="a.ns"></x:b>`);
      expect(resolveXMLNS(rootElement)).toBeUndefined();
    });

    it("returns undefined when there is a default namespace", () => {
      const rootElement = getRootElement(`<x:b xmlns="default.ns"></x:b>`);
      expect(resolveXMLNS(rootElement)).toBeUndefined();
    });
  });
});

describe("The @ui5-language-assistant/logic-utils <isSameXMLNSFromPrefix> function", () => {
  describe("bothe prefixes are defined", () => {
    it("returns true when it's the same prefix", () => {
      const rootElement = getRootElement(`
        <a:root xmlns:a="a.ns">
          <x:first />
          <x:second />
        </a:root>`);
      expect(
        isSameXMLNSFromPrefix(
          "a",
          rootElement.subElements[0],
          "a",
          rootElement.subElements[1]
        )
      ).toBeTrue();
    });

    it("returns true when the prefixes are different but they are resolved to the same namespace", () => {
      const rootElement = getRootElement(`
        <a:root xmlns:a="a.ns" xmlns:x="the.ns" xmlns:y="the.ns">
          <a1:first />
          <a2:second />
        </a:root>`);
      expect(
        isSameXMLNSFromPrefix(
          "x",
          rootElement.subElements[0],
          "y",
          rootElement.subElements[1]
        )
      ).toBeTrue();
    });

    it("returns false when the prefixes are resolved to different namespaces", () => {
      const rootElement = getRootElement(`
        <a:root xmlns:a="a.ns" xmlns:x="x.ns" xmlns:y="y.ns">
          <a1:first />
          <a2:second />
        </a:root>`);
      expect(
        isSameXMLNSFromPrefix(
          "x",
          rootElement.subElements[0],
          "y",
          rootElement.subElements[1]
        )
      ).toBeFalse();
    });

    it("returns false when the prefixes are the same  but one of them is redefined to a different namespace", () => {
      const rootElement = getRootElement(`
        <a:root xmlns:a="a.ns">
          <x:first />
          <x:second xmlns:a="redefined.a" />
        </a:root>`);
      expect(
        isSameXMLNSFromPrefix(
          "a",
          rootElement.subElements[0],
          "a",
          rootElement.subElements[1]
        )
      ).toBeFalse();
    });
  });

  describe("only one of the prefixes is defined", () => {
    it("returns false when default namespace is defined", () => {
      const rootElement = getRootElement(`
        <a:root xmlns:a="a.ns" xmlns="default.ns">
          <b:first />
          <b:second />
        </a:root>`);
      expect(
        isSameXMLNSFromPrefix(
          "a",
          rootElement.subElements[0],
          "x",
          rootElement.subElements[1]
        )
      ).toBeFalse();
      expect(
        isSameXMLNSFromPrefix(
          "x",
          rootElement.subElements[0],
          "a",
          rootElement.subElements[1]
        )
      ).toBeFalse();
    });

    it("returns false when default namespace is not defined", () => {
      const rootElement = getRootElement(`
        <a:root xmlns:a="a.ns">
          <b:first />
          <b:second />
        </a:root>`);
      expect(
        isSameXMLNSFromPrefix(
          "a",
          rootElement.subElements[0],
          "x",
          rootElement.subElements[1]
        )
      ).toBeFalse();
      expect(
        isSameXMLNSFromPrefix(
          "x",
          rootElement.subElements[0],
          "a",
          rootElement.subElements[1]
        )
      ).toBeFalse();
    });

    it("returns false when the other is not sent and the default namespace is defined", () => {
      const rootElement = getRootElement(`
        <a:root xmlns:a="a.ns" xmlns="default.ns">
          <b:first />
          <b:second />
        </a:root>`);
      expect(
        isSameXMLNSFromPrefix(
          "a",
          rootElement.subElements[0],
          undefined,
          rootElement.subElements[1]
        )
      ).toBeFalse();
      expect(
        isSameXMLNSFromPrefix(
          undefined,
          rootElement.subElements[0],
          "a",
          rootElement.subElements[1]
        )
      ).toBeFalse();
    });

    it("returns false when the other is not sent and the default namespace is not defined", () => {
      const rootElement = getRootElement(`
        <a:root xmlns:a="a.ns">
          <b:first />
          <b:second />
        </a:root>`);
      expect(
        isSameXMLNSFromPrefix(
          "a",
          rootElement.subElements[0],
          undefined,
          rootElement.subElements[1]
        )
      ).toBeFalse();
      expect(
        isSameXMLNSFromPrefix(
          undefined,
          rootElement.subElements[0],
          "a",
          rootElement.subElements[1]
        )
      ).toBeFalse();
    });
  });

  describe("both prefixes are not defined", () => {
    it("returns true when it's the same prefix", () => {
      const rootElement = getRootElement(`
        <a:root xmlns:a="a.ns">
          <b:first />
          <b:second />
        </a:root>`);
      expect(
        isSameXMLNSFromPrefix(
          "x",
          rootElement.subElements[0],
          "x",
          rootElement.subElements[1]
        )
      ).toBeTrue();
    });

    it("returns false when it's not the same prefix and the default namespace is not defined", () => {
      const rootElement = getRootElement(`
        <a:root xmlns:a="a.ns">
          <b:first />
          <b:second />
        </a:root>`);
      expect(
        isSameXMLNSFromPrefix(
          "x",
          rootElement.subElements[0],
          "y",
          rootElement.subElements[1]
        )
      ).toBeFalse();
    });

    it("returns false when it's not the same prefix and the default namespace is defined", () => {
      const rootElement = getRootElement(`
        <a:root xmlns:a="a.ns" xmlns="default.ns">
          <b:first />
          <b:second />
        </a:root>`);
      expect(
        isSameXMLNSFromPrefix(
          "x",
          rootElement.subElements[0],
          "y",
          rootElement.subElements[1]
        )
      ).toBeFalse();
    });
  });
});

describe("The @ui5-language-assistant/logic-utils <isSameXMLNS> function", () => {
  describe("bothe prefixes are defined", () => {
    it("returns true when it's the same prefix", () => {
      const rootElement = getRootElement(`
        <a:root xmlns:a="a.ns">
          <a:first />
          <a:second />
        </a:root>`);
      expect(
        isSameXMLNS(rootElement.subElements[0], rootElement.subElements[1])
      ).toBeTrue();
    });

    it("returns true when the prefixes are different but they are resolved to the same namespace", () => {
      const rootElement = getRootElement(`
        <a:root xmlns:a="a.ns" xmlns:x="the.ns" xmlns:y="the.ns">
          <x:first />
          <y:second />
        </a:root>`);
      expect(
        isSameXMLNS(rootElement.subElements[0], rootElement.subElements[1])
      ).toBeTrue();
    });

    it("returns false when the prefixes are resolved to different namespaces", () => {
      const rootElement = getRootElement(`
        <a:root xmlns:a="a.ns" xmlns:x="x.ns" xmlns:y="y.ns">
          <x:first />
          <y:second />
        </a:root>`);
      expect(
        isSameXMLNS(rootElement.subElements[0], rootElement.subElements[1])
      ).toBeFalse();
    });

    it("returns false when the prefixes are the same  but one of them is redefined to a different namespace", () => {
      const rootElement = getRootElement(`
        <a:root xmlns:a="a.ns">
          <a:first />
          <a:second xmlns:a="redefined.a" />
        </a:root>`);
      expect(
        isSameXMLNS(rootElement.subElements[0], rootElement.subElements[1])
      ).toBeFalse();
    });
  });

  describe("only one of the prefixes is defined", () => {
    it("returns false when default namespace is defined", () => {
      const rootElement = getRootElement(`
        <a:root xmlns:a="a.ns" xmlns="default.ns">
          <a:first />
          <x:second />
        </a:root>`);
      expect(
        isSameXMLNS(rootElement.subElements[0], rootElement.subElements[1])
      ).toBeFalse();
      expect(
        isSameXMLNS(rootElement.subElements[1], rootElement.subElements[0])
      ).toBeFalse();
    });

    it("returns false when default namespace is not defined", () => {
      const rootElement = getRootElement(`
        <a:root xmlns:a="a.ns">
          <a:first />
          <x:second />
        </a:root>`);
      expect(
        isSameXMLNS(rootElement.subElements[0], rootElement.subElements[1])
      ).toBeFalse();
      expect(
        isSameXMLNS(rootElement.subElements[1], rootElement.subElements[0])
      ).toBeFalse();
    });

    it("returns false when the other doesn't have a prefix and the default namespace is not defined", () => {
      const rootElement = getRootElement(`
        <a:root xmlns:a="a.ns">
          <a:first />
          <second />
        </a:root>`);
      expect(
        isSameXMLNS(rootElement.subElements[0], rootElement.subElements[1])
      ).toBeFalse();
      expect(
        isSameXMLNS(rootElement.subElements[1], rootElement.subElements[0])
      ).toBeFalse();
    });

    it("returns false when the other doesn't have a prefix and the default namespace is defined to a different namespace", () => {
      const rootElement = getRootElement(`
        <a:root xmlns:a="a.ns" xmlns="default.ns">
          <a:first />
          <second />
        </a:root>`);
      expect(
        isSameXMLNS(rootElement.subElements[0], rootElement.subElements[1])
      ).toBeFalse();
      expect(
        isSameXMLNS(rootElement.subElements[1], rootElement.subElements[0])
      ).toBeFalse();
    });

    it("returns true when the other doesn't have a prefix and the default namespace is defined to the same namespace", () => {
      const rootElement = getRootElement(`
        <a:root xmlns:a="a.ns" xmlns="a.ns">
          <a:first />
          <second />
        </a:root>`);
      expect(
        isSameXMLNS(rootElement.subElements[0], rootElement.subElements[1])
      ).toBeTrue();
      expect(
        isSameXMLNS(rootElement.subElements[1], rootElement.subElements[0])
      ).toBeTrue();
    });
  });

  describe("both prefixes are not defined", () => {
    it("returns true when it's the same prefix", () => {
      const rootElement = getRootElement(`
        <a:root xmlns:a="a.ns">
          <x:first />
          <x:second />
        </a:root>`);
      expect(
        isSameXMLNS(rootElement.subElements[0], rootElement.subElements[1])
      ).toBeTrue();
    });

    it("returns false when it's not the same prefix and the default namespace is not defined", () => {
      const rootElement = getRootElement(`
        <a:root xmlns:a="a.ns">
          <x:first />
          <y:second />
        </a:root>`);
      expect(
        isSameXMLNS(rootElement.subElements[0], rootElement.subElements[1])
      ).toBeFalse();
    });

    it("returns false when it's not the same prefix and the default namespace is defined", () => {
      const rootElement = getRootElement(`
        <a:root xmlns:a="a.ns" xmlns="default.ns">
          <x:first />
          <y:second />
        </a:root>`);
      expect(
        isSameXMLNS(rootElement.subElements[0], rootElement.subElements[1])
      ).toBeFalse();
    });

    it("returns true when there is no prefix and the default namespace is not defined", () => {
      const rootElement = getRootElement(`
        <a:root xmlns:a="a.ns">
          <first />
          <second />
        </a:root>`);
      expect(
        isSameXMLNS(rootElement.subElements[0], rootElement.subElements[1])
      ).toBeTrue();
    });

    it("returns true when there is no prefix and the default namespace is defined", () => {
      const rootElement = getRootElement(`
        <a:root xmlns:a="a.ns" xmlns="default.ns">
          <first />
          <second />
        </a:root>`);
      expect(
        isSameXMLNS(rootElement.subElements[0], rootElement.subElements[1])
      ).toBeTrue();
    });
  });
});

function getRootElement(xmlText: string): XMLElement {
  const { cst, tokenVector } = parse(xmlText);
  const ast = buildAst(cst as DocumentCstNode, tokenVector);
  expectExists(ast.rootElement, "ast root element");
  return ast.rootElement;
}
