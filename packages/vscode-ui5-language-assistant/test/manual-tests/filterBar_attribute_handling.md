# Visual Studio Code - FPM: macros:Table element's filterBar attribute value completion and diagnostics

Associated user stories:

[#505](https://github.com/SAP/ui5-language-assistant/issues/505) Provide code completion and diagnostics for contentPath and metaPath values

## Install latest UI5 Language Assistant

[UI5 Language Assistant](https://marketplace.visualstudio.com/items?itemName=SAPOSS.vscode-ui5-language-assistant)

## Test project

1. Prepare an UI5 Project
   - Your project or
   - Clone [ui5-language-assistant](https://github.com/SAP/ui5-language-assistant) repository and open `test-packages/framework/projects/cap`
2. Launch VSCode and open project root folder
3. Install project dependencies using command `npm install`

**Note:** For this manual test please use `test-packages/framework/projects/cap` project

### **Step 1**: Code completion for filterBar attribute

1. Open custom view template file `app\manage_travels\webapp\ext\mainMain.view.xml`. Wait a short while until UI5 Language assistant server gets ready.
2. Find element `<content>` in the file and place the following content for it:

```XML
     <f:Card>
        <f:DynamicPageHeader id="_IDGenDynamicPageHeader1" pinnable="true">
            <VBox id="_IDGenVBox1">
                <macros:FilterBar  id="FilterBar1" />
            </VBox>
        </f:DynamicPageHeader>
    </f:Card>
    <macros:Table filterBar="" />
```

3. Place the cursor at the position of the element `macros:Table` `filterBar` attribute value and trigger code completion.
4. Observe `FilterBar1` is offered. Choose it and press `Enter`. Observe no error messages are shown for the attribute value.

### **Step 2**: Validation of filterBar attribute

1. Clear `filterBar` attribute value. Observe diagnostics warning: `Trigger code completion to choose one of existing FilterBar ids`.
2. Set the filterBar attribute value as `test`. Observe warning message `FilterBar with id "test" does not exist. Trigger code completion to choose one of existing FilterBar ids`.
3. In the element `macros:FilterBar` rename the attribute `id` to `id_`.
4. Observe new warning message is displayed for `macros:Table filterBar` attribute: `FilterBar with id "test" does not exist`.
5. Clear `filterBar` attribute value. Observe no diagnostics warnings for `macros:Table filterBar`.
