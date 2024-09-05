# Navigation

## Associated user stories:

[#702](https://github.com/SAP/ui5-language-assistant/issues/702) Enable navigation to controller files

## Install latest UI5 Language Assistant

[UI5 Language Assistant](https://marketplace.visualstudio.com/items?itemName=SAPOSS.vscode-ui5-language-assistant)

## Instructions on how to use `Go to Definition` and `Peek Definition` feature

### Go to Definition:

The Go To Definition feature helps you to navigate to the file and opens the result in a new tab.

Place cursor somewhere inside value of XML attribute where navigation is supported and

- keyboard: press `F12` (in Visual Studio Code), or `Ctrl` + `F11` (in SAP Business Application Studio)

- mouse: right click and select `Go To Definition`, or.

- keyboard and mouse: `CTRL` + `Click` (Win), `command ⌘` + `Click` (Mac)

### Peek Definition:

The Peek Definition feature lets you preview file without switching away from the code that you're editing.

Place cursor somewhere inside value of XML attribute where navigation is supported and

- keyboard: press `Alt` + `F12` (Win), `Option ⌥ ` + `F12` (Mac), or

- mouse: right click and select `Peek Definition`

## Test project

1. Prepare an UI5 Project
   - Your project or
   - Clone [ui5-language-assistant](https://github.com/SAP/ui5-language-assistant) repo and open `test-packages/framework/projects/cap`
2. Launch VSCode and open project root folder
3. Install project dependencies using command `npm install`

**Note:** For this manual test, we use `test-packages/framework/projects/cap` project

## Navigate to controller files

1. Open `Main.view.xml` file which is located under `app/manage_travels/webapp/ext/main` folder
2. Place cursor anywhere on `"sap.fe.demo.managetravels.ext.main.Main"`
3. Peek Definition (as described above).
   - Observe `Main.controller.js` is peeked
4. Go to Definition (as described above).
   - Observe navigation to `Main.controller.js`

**Note:**
This feature is supported for value of following xml attributes

- `controllerName`
- `core:require`
- `template:require`

and it can navigate to local file with following extension.

- `<name>.controller.js`
- `<name>.js`
- `<name>.controller.ts`
- `<name>.ts`
