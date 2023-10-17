# Aggregation binding info

## Associated user stories:

[#663](https://github.com/SAP/ui5-language-assistant/issues/663) Provide a minimal code completion, syntax check and tooltip for the aggregation binding notation

## Install latest UI5 Language Assistant

[UI5 Language Assistant](https://marketplace.visualstudio.com/items?itemName=SAPOSS.vscode-ui5-language-assistant)

## Symbol introduction and agreement

- `|` represent cursor position
- Whenever snippet is inserted in an `.xml` file, please remove `|` and remember its position

## Test project

1. Prepare an UI5 Project
   - Your project or
   - Clone [ui5-language-assistant](https://github.com/SAP/ui5-language-assistant) repo and open `test-packages/framework/projects/cap`
2. Launch VSCode and open project root folder
3. Install project dependencies using command `npm install`

**Note:** For this manual test, we use `test-packages/framework/projects/cap` project

## Sanity Check

Open `Main.view.xml` file which is located under `app/manage_travels/webapp/ext/main` folder

### No Diagnostic or Code Completion if there is not at least a key with colon

1. Copy and paste snippet `<Table items="{pa|th}" id="test-id"></Table>`
2. Check that no diagnostic is reported for `items="{path}`
3. Request code completion at cursor position
4. Check no code completion is provided

### No Diagnostic or Code Completion for metadata binding

1. Copy and paste snippet `<Table items="{/#Comp|any}" id="test-id"></Table>`
2. Check that no diagnostic is reported for `items="{/#Company...}"`
3. Request code completion at cursor position
4. Check no code completion is provided

### No Diagnostic or Code Completion for simple binding

1. Copy and paste snippet `<Table items="{/li|st}" id="test-id"></Table>`
2. Check that no diagnostic is reported for `items="{/list}"`
3. Request code completion at cursor position
4. Check no code completion is provided
   d

### No Diagnostic for empty string

1. Copy and paste snippet `<Table items="" id="test-id"></Table>`
2. Check that no diagnostic is reported for `items=""`

## Code completion

Open `Main.view.xml` file which is located under `app/manage_travels/webapp/ext/main` folder

### Empty string

1. Copy and paste snippet `<Table items="" id="test-id"></Table>`
2. Request code completion at cursor position
3. Following snippets are provide as code completion
   - `{ }`
   - `{:= }`
   - `{= }`
4. Select `{ }`. It is inserted and request code completion all aggregation binding info items are suggest as completion items
5. Select `path`. `items` attribute content looks like: `items="{ path: '' }"`

### Empty structure

1. Copy and paste snippet `<Table items="{|}" id="test-id"></Table>`
2. Request code completion at cursor position
3. All aggregation binding info items are suggest as completion items
4. Select `path`. Item and its value is inserted. `items` attribute content looks like: `items="{ path: '' }"`
5. Add a comma and request code completion. Completion items are provided. Previously added item e.g `path` is not present in the list.

### Value

1. Copy and paste snippet `<Table items="{path: |}" id="test-id"></Table>`
2. Request code completion at cursor position
3. `''` is provided as completion item
4. Select `''`. `items` attribute content looks like: `items="{ path: '' }"`

## Diagnostics

Open `Main.view.xml` file which is located under `app/manage_travels/webapp/ext/main` folder

### Unknown aggregation binding

1. Copy and paste snippet `<Table items="{path:'test-path', sorte: [] }" id="test-id"></Table>`
2. Check that a diagnostic with message `Unknown aggregation binding` is reported

### Expect colon

1. Copy and paste snippet `<Table items="{path'test-path', sorter: [] }" id="test-id"></Table>`
2. Check that a diagnostic with message `Expect colon` is reported

### Expect value

1. Copy and paste snippet `<Table items="{path:, sorter: [] }" id="test-id"></Table>`
2. Check that a diagnostic with message `Expect '' as a value` is reported

### Extra colon

1. Copy and paste snippet `<Table items="{path::'', sorter: [] }" id="test-id"></Table>`
2. Check that a diagnostic with message `Too many colon` is reported

### Missing comma

1. Copy and paste snippet `<Table items="{path:'' sorter: [] }" id="test-id"></Table>`
2. Check that a diagnostic with message `Missing comma` is reported

### Extra comma

1. Copy and paste snippet `<Table items="{path:'',,, sorter: [] }" id="test-id"></Table>`
2. Check that a diagnostic with message `Too many commas` is reported

### Trailing comma

1. Copy and paste snippet `<Table items="{path:'', sorter: [], }" id="test-id"></Table>`
2. Check that a diagnostic with message `Trailing comma` is reported

## Hover tooltip

Open `Main.view.xml` file which is located under `app/manage_travels/webapp/ext/main` folder

### on name

1. Copy and paste snippet `<Table items="{pa|th:'', sorter: [] }" id="test-id"></Table>`
2. Request hover at cursor position
3. A tooltip appears which has `Type`, `Description`, `Optional` and a link `More information`

### on name inside collection

1. Copy and paste snippet `<Table items="{path:'', sorter: [{pa|th: ''}] }" id="test-id"></Table>`
2. Request hover at cursor position
3. A tooltip appears which has `Type`, `Description`, `Optional` and a link `More information`

**Note:** There is currently no hover support on value

## Semantic highlighting

Make sure that semantic highlighting is enabled. For details check [here](https://code.visualstudio.com/api/language-extensions/semantic-highlight-guide#enablement-of-semantic-highlighting)

Aggregation binding has below semantic highlighting

- keys e.g `part` has same semantic highlighting as of xml attribute
- colon e.g `:` and comma e.g `,` has same semantic highlighting as of colon in `<mvc:View>`
- brackets e.g `{} or []` and string value e.g `"double quote string" or 'single quote string'` has same semantic highlighting as of xml string value
- `boolean`, `number` and `null` has same semantic highlighting as of their respective javascript counterpart

**Note:** Semantic highlighting works fine with all vscode included themes
