# Visual Studio Code - FPM: macros elements metaPath completion and diagnostics (property path)

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

### **Step 1**: Code completion for metaPath

1. Open custom view template file `app\manage_travels\webapp\ext\mainMain.view.xml`. Wait a short while until UI5 Language assistant server gets ready.
2. Find element `<content>` in the file and place the following snippet as its child element:

```XML
    <macros:Field metaPath="" id="field1" />
```

4. Place the cursor at the position of the `metaPath` attribute value and trigger code completion.
5. Observe the list of suggestions for the first path segment. Make sure that list is sort as:

   - properties of the current default entity set `Travel` specified in manifest
   - navigation segments
   - entity types with absolute path
   - entity sets
   - entity container

   Choose first property and press `Enter`. Observe no error messages are shown for the attribute value.

6. Place cursor at value's first position and trigger code completion. Choose option `to_Booking` and press `/` to confirm. Observe the segment is added, and completion for next segment is triggered. Choose navigation property `to_Travel` and press `/` to confirm. Observe `Travel` properties are listed and further navigation segment `to_Booking` is not available to avoid cyclic routes. Choose first property and press `Enter`. Observe no error messages are shown for the attribute value.
7. Remove entire current element and place following snippet instead:

```XML
    <macros:Field contextPath="/Travel" metaPath="" id="field1" />
```

8. Place cursor in the `metaPath` value and trigger code completion. Observe only properties and no other navigation segments are suggested. Press `Enter` to insert first property into the document. Observe no error messages are shown for the attribute value.
9. Observe info message is shown for the contextPath value: `Context path for Field is usually defined if binding for the object is different than that of the page`.

### **Step 2**: Validation of metaPath attribute

1. Remove `contextPath` attribute and its value from the current `macros:Field` element and clear `metaPath` value.
2. Observe diagnostics warning: `Property path value cannot be empty`.
3. Set the metaPath attribute value as `@com.sap.vocabularies.UI.v1.Chart#sample1`. Observe warning message `Unknown path: "/Travel/@com.sap.vocabularies.UI.v1.Chart#sample1"`.
4. Set the metaPath attribute value as `to_Booking`. Observe warning message `Invalid path value. The path leads to Edm.EntityType, but expected type is Edm.Property`.
5. Set the metaPath attribute value as `/Booking/BookingID`. Observe no warning messages for the value. Absolute path is allowed.
6. Set the metaPath attribute value as `to_Booking/BookingID1`. Observe warning message `Unknown path: "/Travel/to_Booking/BookingID1"` is shown for the last path segment.
7. Replace current macros element with the snippet:

```XML
    <macros:Field contextPath="/TravelService.EntityContainer/Travel" metaPath="" id="field1" />
```

8. Set the metaPath attribute value as `test`. Observe warning message `Unknown path: "/TravelService.EntityContainer/Travel/test`.
9. Set the metaPath attribute value as `to_Booking/BookedFlights`. Observe warning message `Navigation segments not allowed when contextPath is provided`.
