/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------*/

"use strict";

import { Uri } from "vscode";
import vscode = require("vscode");
export const extensionId = "vscode-ui5-language-assistant";
export const GO_MODE: vscode.DocumentFilter = {
  language: "go",
  scheme: "file",
};

export class utils {
  getNamespace(text, editor): string {
    const namespace = text.includes(":") ? text.split(":")[0] : "";
    text = text.includes(":") ? text.split(":")[1] : text;

    let xmlns = editor.document
      .getText()
      .split("\n")
      .find((line) => {
        return namespace === ""
          ? line.includes("xmlns=")
          : line.includes("xmlns") && line.includes(namespace);
      })
      .trim();

    xmlns = xmlns.includes(">") ? xmlns.slice(0, -1) : xmlns;
    const regex = new RegExp(
      namespace === "" ? `xmlns="(.*?)"` : `xmlns:${namespace}="(.*?)\"`
    );
    xmlns = xmlns.match(regex)[0].match(/\"(.*?)\"/)[1];

    return `${xmlns}.${text}`;
  }

  findControl(editor) {
    const isLowerCase = (string) => {
      return /^[a-z]*$/.test(string);
    };

    const cursorPosition = editor.selection.active;
    let line = editor.document.lineAt(cursorPosition.line);
    let text = line.text.trim();

    if (text.includes("<")) {
      //If the first character after the < is lowercase, then it's an aggregation
      if (
        isLowerCase(text.charAt(1) === "/" ? text.charAt(2) : text.charAt(1)) &&
        isLowerCase(
          text.indexOf(":") === -1 ? true : text.charAt(text.indexOf(":") + 1)
        )
      ) {
        let foundControl = false;
        let count = 1;
        const navigator = text.charAt(1) === "/" ? "-" : "+";

        while (foundControl === false) {
          count =
            navigator === "+"
              ? cursorPosition.line - count
              : cursorPosition.line + count;
          line = editor.document.lineAt(count);
          text = line.text.trim();
          if (
            text.includes("<") &&
            !isLowerCase(
              text.charAt(1) === "/" ? text.charAt(2) : text.charAt(1)
            )
          ) {
            foundControl = true;
          } else {
            count++;
          }
        }
      }

      //just for good measure, check if it's the end tag
      const tagSplit = text.includes("</") ? "</" : "<";
      const endSplit = text.includes(" ")
        ? " "
        : text.includes(">")
        ? ">"
        : "\n";
      text = text.split(tagSplit)[1].split(endSplit)[0];
    } else {
      let count = cursorPosition.line - 1;
      text = "";

      while (!text) {
        line = editor.document.lineAt(count);
        text = line.text.trim();

        if (text.includes("<")) {
          const endSplit = text.includes(">")
            ? ">"
            : text.includes(" ")
            ? " "
            : "\n";
          text = text.split("<")[1].split(endSplit)[0];
        } else {
          count = count - 1;
        }
      }
    }

    text = text.includes(">") ? text.slice(0, -1) : text;

    return this.getNamespace(text, editor);
  }

  public getWebviewContent(
    control: string | undefined,
    ui5Url: string
  ): string {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0px;padding:0px;overflow:hidden">
        <iframe frameborder="0" style="overflow:hidden;overflow-x:hidden;overflow-y:hidden;height:100%;width:100%;position:absolute;top:0px;left:0px;right:0px;bottom:0px" height="100%" width="100%" src="${Uri.parse(
          ui5Url
        )}${control ? "#/api/" + control : ""}"></iframe>
    </body>
    </html>`;
  }
}
