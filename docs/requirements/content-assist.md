# Content Assist Requirements

## Common Requirements

### MVP Scope

- Filter by declared namespaces in doc, e.g: `xmlns="sap.m"`.
- Suggestion to include description.
- Suggestion to include deprecation indication.
- Only suggest UI5 constructs constructs with `public` or `protected`(?) visibility.

### Possible Future Scope

- Provide Suggestions from none declared namespaces(libraries), sub scenarios:
  - Not declared in XML Doc but declared in package.json/ui5.yaml
  - Not declared in XMl Doc **and** package.json/ui5.yaml --> Also add dependency to package.json/ui5.yaml
  
- Suggestion to include type Icon, e.g "C" for Class "AG" for aggregation.
  - If possible in LSP?
  
- Aggregations: Filter by Type and consider cardinality.  

## Class Name in Open Tag Scenario

`⇶` marks the content assist point.

```xml
<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" controllerName="sap.ui.demo.todo.controller.App" displayBlock="true">
  <Shell>
    <App>
      <Page title="{i18n>TITLE}" backgroundDesign="List">
        <footer>
          <Bar>
            <contentRight>
              <But⇶
            </contentRight>
          </Bar>
        </footer>
      </Page>
    </App>
  </Shell>
</mvc:View>
```

### MVP Scope

- UI5 Classes which begin with `But`, e.g: `sap.m.Button`
- UI5 Classes which contain `But`, e.g: `sap.m.MenuButton`

### Possible Future Scope

### Open Questions

- Does the XML hierarchy affect possible suggestions? Can a `sap.m.Button` appear anywhere?
  or only in some places? How is this information encoded in the UI5 Metadata?
