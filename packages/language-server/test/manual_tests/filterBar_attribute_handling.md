# Visual Studio Code - FPM: macros:Table element's filterBar attribute value completion and diagnostics

Associated user stories:

[#505](https://github.com/SAP/ui5-language-assistant/issues/505) Provide code completion and diagnostics for contentPath and metaPath values

## **Setup**: Clone test project

In case you haven't done it yet:

1. Clone the CAP test project located [here](./project/flight/cap).
2. Install project dependencies using command `npm install`.
3. Launch VSCode and open project root folder

### **Step 1**: Code completion for filterBar attribute

1. Open custom view template file `app\manage_travels\webapp\Main.view.xml`. Wait a short while until UI5 Language assistant server gets ready.
2. Find element `<f:header>` in the file. Make sure there is nested `macros:FilterBar` element. Set its `id` attribute value to `FilterBar1`. If element doesn't exist, then create the following `f:header` content:

```XML
    <f:header>
        <f:DynamicPageHeader id="_IDGenDynamicPageHeader1" pinnable="true">
            <VBox id="_IDGenVBox1">
                <macros:FilterBar  id="FilterBar1" />
            </VBox>
        </f:DynamicPageHeader>
    </f:header>
```

3. Find element `<f:content>` in the file and place the following snippet as its child element:

```XML
    <macros:Table filterBar="" />
```

4. Place the cursor at the position of the `filterBar` attribute value and trigger code completion.
5. Observe `FilterBar1` is offered. Choose it and press `Enter`. Observe no error messages are shown for the attribute value.

### **Step 2**: Validation of filterBar attribute

1. Clear `filterBar` attribute value. Observe diagnostics warning: `Trigger code completion to choose one of existing FilterBar ids`.
2. Set the filterBar attribute value as `test`. Observe warning message `FilterBar with id "test" does not exist. Trigger code completion to choose one of existing FilterBar ids`.
3. In the element `macros:FilterBar` rename the attribute `id` to `id_`.
4. Observe new warning message is displayed for `macros:Table filterBar` attribute: `FilterBar with id "test" does not exist`.
5. Clear `filterBar` attribute value. Observe no diagnostics warnings for `macros:Table filterBar`.
