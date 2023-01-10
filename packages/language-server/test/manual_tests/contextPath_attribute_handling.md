# Visual Studio Code - FPM: macros elements contextPath completion and diagnostics

Associated user stories:
[#21639](https://github.wdf.sap.corp/ux-engineering/tools-suite/issues/21639) [AppM] FPM: Enhance ui5-language-assistant with LSP annotation-relevant building blocks
[#21840](https://github.wdf.sap.corp/ux-engineering/tools-suite/issues/21840) [AppM] FPM: Enhancements for annotation-related features ui5-language-assistant

## **Setup**: Clone test project

In case you haven't done it yet:

1. Clone the CAP test project located [here](./project/flight/cap).
2. Install project dependencies using command `npm install`.
3. Launch VSCode and open project root folder

### **Step 1**: Code completion for contextPath

1. Open annotations file `app\manage_travels\annotations.cds` and append following snippet to the end of file and save it:

```c++
annotate service.Travel with @(
    UI.Chart #sample1: {
        type: '',
    }
);
```

2. Open custom view template file `app\manage_travels\webapp\Main.view.xml`. Wait a short while until UI5 Language assistant server gets ready.
3. Find element `<f:content>` in the file and place the following snippet as its child element :

```XML
    <macros:Chart contextPath="" id="chart1" />
```

4. Place the cursor at the position of the value of `contextPath` attribute and trigger code completion.
5. Observe the list of suggestions for the first absolute path segment (i.e. with all items having leading `­/` symbol). Check that all entity types with short names are listed first, then follow entity set names with container name as prefix, and the last item in the list is entity container itself.
6. Press `Esc`, then enter value `/` and trigger code completion again.
7. Observe the same list of options, but without leading slashes `/` in their names.
8. Choose option `Travel` and press Enter. Observe no diagnostics warnings are shown for the attribute.
9. Press `/` and observe suggestion list is shown for next path segment. The list should contain all available navigation segments.
10. Choose option `to_Booking` and press `/` to confirm. Observe the segment is added, and completion for next segment is triggered. Observe navigation property `to_Travel` is not included in the list to avoid cyclic routes.
11. Change current element name from `macros:Chart` to `macros:Table`. Observe info message is shown for the attribute value `Context path for Table is usually defined if binding for the object is different than that of the page`.
12. Place the cursor at the first position of the `contextPath` attribute value and trigger code completion. Observe no suggestions shown, because completion is suppressed where use of contextPath is not recommended.

### **Step 2**: Validation of contextPath attribute

1. Change current element name from `macros:Table` back to `macros:Chart`.
2. Set the contextPath attribute value as empty string. Hover the `contextPath` attribute value and observe diagnostics warning: `contextPath value cannot be empty. Enter value or remove contextPath property`.
3. Set the contextPath attribute value as `to_Booking`. Observe warning message `Invalid contextPath value: "to_Booking". Absolute path is expected`.
4. Set the contextPath attribute value as `/Travel/to_Booking1`. Observe warning message `Unknown context path: "/Travel/to_Booking1"` is shown for last path segment.
5. Set the contextPath attribute value as `/Travel/TravelID`. Observe warning message `Invalid contextPath value. It leads to entity property, but expected types are: Edm.EntitySet, Edm.EntityType, Edm.Singleton, Edm.NavigationProperty`.
6. Set the contextPath attribute value as `/Airport`. Observe warning message `Invalid contextPath value. It does not lead to any annotations of the expected type`.
