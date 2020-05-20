import {
  getDeprecationPlainTextSnippet,
  convertJSDocToMarkdown,
} from "../../src/utils/documentation";
import { expect } from "chai";
import { buildUI5Model } from "@ui5-language-assistant/test-utils";
import { padEnd } from "lodash";

describe("The @ui5-language-assistant/logic-utils <getDeprecationPlainTextSnippet> function", () => {
  const model = buildUI5Model({});

  it("returns a snippet without title, since and text", () => {
    expect(
      getDeprecationPlainTextSnippet(
        undefined,
        {
          isDeprecated: true,
          since: undefined,
          text: undefined,
        },
        model
      )
    ).to.equal("Deprecated.");
  });

  it("returns a snippet with title and without since and text", () => {
    expect(
      getDeprecationPlainTextSnippet(
        "This class is deprecated",
        {
          isDeprecated: true,
          since: undefined,
          text: undefined,
        },
        model
      )
    ).to.equal("This class is deprecated.");
  });

  it("returns a snippet with since and without text", () => {
    expect(
      getDeprecationPlainTextSnippet(
        undefined,
        {
          isDeprecated: true,
          since: "1.2.3",
          text: undefined,
        },
        model
      )
    ).to.equal("Deprecated since version 1.2.3.");
  });

  it("returns a snippet without since and with text", () => {
    expect(
      getDeprecationPlainTextSnippet(
        undefined,
        {
          isDeprecated: true,
          since: undefined,
          text: "Use something else instead.",
        },
        model
      )
    ).to.equal("Deprecated. Use something else instead.");
  });

  it("returns a snippet with since and text", () => {
    expect(
      getDeprecationPlainTextSnippet(
        undefined,
        {
          isDeprecated: true,
          since: "1.2.3",
          text: "Use something else instead.",
        },
        model
      )
    ).to.equal("Deprecated since version 1.2.3. Use something else instead.");
  });

  context("text has jsdoc tags", () => {
    it("removes header tags", () => {
      expect(
        getDeprecationPlainTextSnippet(
          undefined,
          {
            isDeprecated: true,
            since: undefined,
            text: "<h1>The Title</h1>",
          },
          model
        )
      ).to.equal("Deprecated. \nThe Title\n");
    });

    it("replaces <br> tags with newline", () => {
      expect(
        getDeprecationPlainTextSnippet(
          undefined,
          {
            isDeprecated: true,
            since: undefined,
            text: "The Title<br/>some text",
          },
          model
        )
      ).to.equal("Deprecated. The Title\nsome text");
    });

    it("replaces link tags with their text", () => {
      expect(
        getDeprecationPlainTextSnippet(
          undefined,
          {
            isDeprecated: true,
            since: undefined,
            text:
              "This text has a {@link the_address link with text} and a {@link link_without_text}",
          },
          model
        )
      ).to.equal(
        "Deprecated. This text has a link with text and a link_without_text"
      );
    });
  });

  it("only returns the first text sentence when the sentence is followed by a space", () => {
    expect(
      getDeprecationPlainTextSnippet(
        undefined,
        {
          isDeprecated: true,
          since: undefined,
          text: "This text has two sentences. This is the second sentence.",
        },
        model
      )
    ).to.equal("Deprecated. This text has two sentences.");
  });

  it("only returns the first text sentence when the sentence is followed by a newline", () => {
    expect(
      getDeprecationPlainTextSnippet(
        undefined,
        {
          isDeprecated: true,
          since: undefined,
          text: "This text has two sentences.\nThis is the second line.",
        },
        model
      )
    ).to.equal("Deprecated. This text has two sentences.");
  });

  it("only returns the first text sentence when the sentence is followed by a jsdoc <br> tag", () => {
    expect(
      getDeprecationPlainTextSnippet(
        undefined,
        {
          isDeprecated: true,
          since: undefined,
          text: "This text has two sentences.<br/>This is the second line.",
        },
        model
      )
    ).to.equal("Deprecated. This text has two sentences.");
  });

  it("only returns the first 500 characters of the text", () => {
    expect(
      getDeprecationPlainTextSnippet(
        undefined,
        {
          isDeprecated: true,
          since: undefined,
          text: padEnd(
            "This text only has one sentence but it is VERY long: ",
            700,
            "1234567890"
          ),
        },
        model
      )
    ).to.equal(
      "Deprecated. " +
        padEnd(
          "This text only has one sentence but it is VERY long: ",
          500,
          "1234567890"
        ) +
        "..."
    );
  });
});

describe("The @ui5-language-assistant/logic-utils <convertJSDocToMarkdown> function", () => {
  const model = buildUI5Model({});

  it("replaces header tags", () => {
    expect(convertJSDocToMarkdown("<h1>The Title</h1>", model)).to.equal(
      "\n# The Title\n\n"
    );
  });

  it("replaces <br> tags with newline", () => {
    expect(convertJSDocToMarkdown("The Title<br/>some text", model)).to.equal(
      "The Title\nsome text"
    );
  });

  it("replaces link tags with markdown links", () => {
    expect(
      convertJSDocToMarkdown(
        "This text has a {@link http://my.link link with text} and a {@link https://link.without.text}",
        model
      )
    ).to.equal(
      "This text has a [link with text](http://my.link) and a [https://link.without.text](https://link.without.text)"
    );
  });

  it("replaces link tags that point to UI5 classes with markdown links when model has a version", () => {
    const modelWithVersion = buildUI5Model({ version: "1.2.3" });
    expect(
      convertJSDocToMarkdown(
        "This text has a {@link sap.m.Button link to Button} and a nameless link to a type: {@link sap.m.Button}",
        modelWithVersion
      )
    ).to.equal(
      "This text has a [link to Button](https://sapui5.hana.ondemand.com/1.2.3/#/api/sap.m.Button) and a nameless link to a type: [sap.m.Button](https://sapui5.hana.ondemand.com/1.2.3/#/api/sap.m.Button)"
    );
  });

  it("replaces link tags that point to UI5 classes with markdown links when model doesn't have a version", () => {
    expect(
      convertJSDocToMarkdown(
        "This text has a {@link sap.m.Button link to Button} and a nameless link to a type: {@link sap.m.Button}",
        model
      )
    ).to.equal(
      "This text has a [link to Button](https://sapui5.hana.ondemand.com/#/api/sap.m.Button) and a nameless link to a type: [sap.m.Button](https://sapui5.hana.ondemand.com/#/api/sap.m.Button)"
    );
  });

  it("unescapes html entities after replacing tags", () => {
    expect(
      convertJSDocToMarkdown("This text has a <br> and a &lt;br&gt;", model)
    ).to.equal("This text has a \n and a <br>");
  });
});
