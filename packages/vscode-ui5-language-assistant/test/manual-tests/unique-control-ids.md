# Unique control IDs

## Associated user stories:

[#646](https://github.com/SAP/ui5-language-assistant/issues/646) Generate ID's: make this unique for a whole project

## Install latest UI5 Language Assistant

[UI5 Language Assistant](https://marketplace.visualstudio.com/items?itemName=SAPOSS.vscode-ui5-language-assistant)

## Test project

1. Prepare an UI5 Project
   - Your project or
   - Clone [ui5-language-assistant](https://github.com/SAP/ui5-language-assistant) repo and open `test-packages/framework/projects/cap`
2. Launch VSCode and open project root folder
3. Install project dependencies using command `npm install`

**Note:** For this manual test, we use `test-packages/framework/projects/cap` project

## Diagnostic

1. Open `Main.view.xml` file which is located under `app/manage_travels/webapp/ext/main` folder
2. Copy and paste snippet below inside `<Content>` tag

```xml
   <Text id="_IDGenText" >
   <Button id="_IDGenButton" />
```

3. Check that no diagnostic is reported as there is not duplicate id
4. Create a new file e.g `MyTest.view.xml` under webapp and copy paste content of `Main.view.xml` file in `MyTest.view.xml`
5. Check that diagnostics are reported for duplicate ids. e.g `Main`
6. Remove `MyTest.view.xml` file
7. Check that no diagnostic is reported as duplicate ids are removed

##### Note

You can navigate to related file where identical ids are used

## Quick fix

1. Open `Main.view.xml` file which is located under `app/manage_travels/webapp/ext/main` folder
2. Copy and paste snippet below inside `<Content>` tag

```xml
   <Text  >
   <Text  >
   <Button id="" />
```

3. Diagnostic is reported for missing id e.g `The "Text" class can't have an empty ID attribute when flexEnabled is "true" in manifest.json.`
4. Click on `Text` tag. Light bulb appears
5. Click on light bulb. Two options are displayed. `Generate a unique ID` and `Generate unique IDs for the entire file`
6. Click on `Generate a unique ID`. Unique Id is generated. This ID is unique for entire app
7. Click on `Button` tag. Light bulb appears
8. Click on light bulb and select `Generate unique IDs for the entire file`. Unique Ids are generated. These IDs are unique for entire app
