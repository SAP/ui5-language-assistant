# Visual Studio Code - FPM: macros elements metaPath completion and diagnostics (property path)

Associated user stories:
[#21639](https://github.wdf.sap.corp/ux-engineering/tools-suite/issues/21639) [AppM] FPM: Enhance ui5-language-assistant with LSP annotation-relevant building blocks
[#21840](https://github.wdf.sap.corp/ux-engineering/tools-suite/issues/21840) [AppM] FPM: Enhancements for annotation-related features ui5-language-assistant

## **Setup**: Clone test project

In case you haven't done it yet:

1. Clone test CAP project from the [GitHub](https://github.wdf.sap.corp/D035359/teched2022-Prep/tree/app).
2. Install project dependencies using command `npm install`.
3. Launch VSCode and open project root folder

### **Step 1**: Code completion for metaPath

1. Open custom view template file `app\manage_travels\webapp\Main.view.xml`. Wait a short while until UI5 Language assistant server gets ready.
2. Find element `<f:content>` in the file, remove its child element and place the following snippet instead:

```XML
    <macros:Field metaPath="" id="field1" />
```

4. Place cursor in `metaPath` attribute value position and trigger code completion.
5. Observe the list of suggestions for the first path segment. Make sure there first go properties of the current default entity set `Travel` specified in manifest, then follow possible navigation segments. Choose first property and press `Enter`. Observe no error messages are shown for the attribute value.
6. Place cursor at value's first position and trigger code completion. Choose option `to_Booking` and press `/` to confirm. Observe the segment is added, and completion for next segment is triggered. Choose navigation property `to_Travel` and press `/` to confirm. Observe `Travel` properties are listed and further navigation segment `to_Booking` is not available to avoid cyclic routes. Choose some property and press `Enter` to insert the term into the document. Observe no error messages are shown for the attribute value.
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

8. Set the metaPath attribute value as `test`. Observe warning message `Unknown annotation path: "/TravelService.EntityContainer/Travel/test`.
9. Set the metaPath attribute value as `to_Booking/to_Booking/BookedFlights`. Observe warning message `Navigation segments not allowed when contextPath is provided`.
