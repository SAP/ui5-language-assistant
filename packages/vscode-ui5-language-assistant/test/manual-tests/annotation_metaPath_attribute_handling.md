# Visual Studio Code - FPM: macros elements metaPath completion and diagnostics (annotation path)

## Associated user stories:

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

### **Step 1**: Code completion for metaPath

1. Open annotations file `app\manage_travels\annotations.cds` and append following snippet to the end of file and save it:

```cpp
annotate service.Travel with @(
    UI.Chart #sample1: {
        type: '',
    },
    UI.LineItem: []
);
```

2. Open custom view template file `app\manage_travels\webapp\ext\mainMain.view.xml`. Wait a short while until UI5 Language assistant server gets ready.
3. Find element `<content>` in the file and place the following snippet as its child element :

```XML
    <macros:Chart metaPath="" id="chart1" />
```

4. Place the cursor at the position of the value of `metaPath` attribute and trigger code completion.
5. Observe the list of suggestions for the first path segment. Make sure the chart annotation term with qualifier `sample1` is listed first, then follow possible navigation segments. Choose annotation term name and press `Enter`. Observe no error messages are shown for the attribute value.
6. Place cursor at value's first position and trigger code completion. Choose option `to_Booking` and press `/` to confirm. Observe the segment is added, and completion for next segment is triggered. Choose navigation property `to_Travel` and press `/` to confirm. Observe only term is suggested as final path segment and further navigation segment `to_Booking` is not available to avoid cyclic routes. Press `Enter` to insert the term into the document. Observe no error messages are shown for the attribute value.
7. Remove entire current element and place following snippet instead:

```XML
    <macros:Chart contextPath="/Travel" metaPath="" id="chart1" />
```

8. Place the cursor at the `metaPath` value and trigger code completion. Observe only term and no other navigation segments are suggested. Press `Enter` to insert the term into the document. Observe no error messages are shown for the attribute value.

### **Step 2**: Validation of metaPath attribute

1. Remove `contextPath` attribute and its value from the current `macros:Chart` element and clear `metaPath` value.
2. Observe diagnostics warning: `Annotation path value cannot be empty`.
3. Set the metaPath attribute value as `@com.sap.vocabularies.UI.v1.Chart#sample`. Observe warning message `Unknown annotation path: "/Travel/@com.sap.vocabularies.UI.v1.Chart#sample"`.
4. Set the metaPath attribute value as `to_Booking`. Observe warning message `Path value must end with annotation term. Use code completion to select annotation path`.
5. Set the metaPath attribute value as `/Travel/@com.sap.vocabularies.UI.v1.Chart#sample1`. Observe warning message `Absolute annotation paths not allowed in metaPath. Use contextPath attribute to change path context`
6. Set the metaPath attribute value as `@com.sap.vocabularies.UI.v1.LineItem`. Observe warning message `Invalid annotation term: "@com.sap.vocabularies.UI.v1.LineItem". Trigger code completion to choose one of allowed annotations`.
7. Go to app manifest file, find `routing\targets\TravelMain` settings entry and rename `entitySet` property in the nested object structure to `entitySet_`. Save the file.
8. Set the metaPath attribute value as `@com.sap.vocabularies.UI.v1.Chart#sample1`. Observe info message `EntitySet or contextPath for the current view are not defined in application manifest. Attribute value completion and diagnostics is not possible if EntitySet or contextPath are not defined or defined dynamically in controllers`.
9. Revert manifest change that is done at previous step 7. Change property `entitySet` value to `Travel_`. Save the file.
10. Set the metaPath attribute value as `@com.sap.vocabularies.UI.v1.Chart#sample`. Observe info message `Entity Set "Travel_" specified in manifest for the current view is not found. Attribute value completion and diagnostics are disabled`.
11. Reset property `entitySet` value to `Travel` in app manifest. Save the file.
12. Replace current macros element with the snippet:

```XML
    <macros:Chart contextPath="/TravelService.EntityContainer/Travel" metaPath="" id="chart1" />
```

13. Set the metaPath attribute value as `@com.sap.vocabularies.UI.v1.Chart#sample`. Observe warning message `Unknown annotation path: "/TravelService.EntityContainer/Travel/@com.sap.vocabularies.UI.v1.Chart#sample`.
14. Set the metaPath attribute value as `to_Booking/@com.sap.vocabularies.UI.v1.Chart#sample`. Observe warning message `Navigation segments not allowed when contextPath is provided`.
