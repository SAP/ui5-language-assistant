# Property binding info

## Associated user stories:

[#563](https://github.com/SAP/ui5-language-assistant/issues/563) Provide a minimal code completion and syntax check for the simple binding notation

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

1. Copy and paste snippet `<Text text="{pa|th} id="test-id"></Text>`
2. Check that no diagnostic is reported for `text="{path}`
3. Request code completion at cursor position
4. Check no code completion is provided

### No Diagnostic or Code Completion for metadata binding

1. Copy and paste snippet `<Input maxLength="{/#Comp|any/ZipCode/@maxLength}" id="test-id"/>`
2. Check that no diagnostic is reported for `maxLength="{/#Company...}"`
3. Request code completion at cursor position
4. Check no code completion is provided

### No Diagnostic or Code Completion for simple binding

1. Copy and paste snippet `<Input value="{/firs|tName}" id="test-id"/>`
2. Check that no diagnostic is reported for `value="{/firstName}"`
3. Request code completion at cursor position
4. Check no code completion is provided

### No Diagnostic or Code Completion for aggregation property

1. Copy and paste snippet `<List items="{invoice|>/Invoices}" id="test-id"> </List>`
2. Check that no diagnostic is reported for `items="{invoice>/Invoices}"`
3. Request code completion at cursor position
4. Check no code completion is provided

**Note:** Hover on `items` attribute to find out if this attribute is `(aggregation)` or `(property)`

### No Diagnostic or Code Completion for resource model

1. Copy and paste snippet `<Label labelFor="address" text="{i18n>ad|dress}:" id="test-id"/>`
2. Check that no diagnostic is reported for `text="{i18n>address}:"`
3. Request code completion at cursor position
4. Check no code completion is provided

### No Diagnostic for empty string

1. Copy and paste snippet `<Input value="" id="test-id"/>`
2. Check that no diagnostic is reported for `value=""`

### No Diagnostic for empty structure

1. Copy and paste snippet `<Input value="{ }" id="test-id"/>`
2. Check that no diagnostic is reported for `value="{ }"`

## Code completion

Open `Main.view.xml` file which is located under `app/manage_travels/webapp/ext/main` folder

### Empty string

1. Copy and paste snippet `<Input value="|" id="test-id"/>`
2. Request code completion at cursor position
3. Following snippets are provide as code completion
   - `{ }`
   - `{:= }`
   - `{= }`
4. Select `{ }`. It is inserted and all property binding info items are suggest as completion items
5. Select `path` and `' '` for its value. `Value` attribute content looks like: `value="{ path: ' ' }"`

### Empty structure

1. Copy and paste snippet `<Input value="{|}" id="test-id"/>`
2. Request code completion at cursor position
3. All property binding info items are suggest as completion items
4. Select `path`. Item and its value is inserted. `Value` attribute content looks like: `value="{ path: ' ' }"`
5. Add a comma and request code completion. Completion items are provided. Previously added item e.g `path` is not present in the list. Select `mode`. Item and its value is inserted.`Value` attribute content looks like: `value="{ path: ' ', mode:' ' }"`

### Value

1. Copy and paste snippet `<Input value="{path: | }" id="test-id"/>`
2. Request code completion at cursor position
3. `' '` is provided as completion item
4. Select `' '`. `Value` attribute content looks like: `value="{ path: ' ' }"`

## Diagnostics

Open `Main.view.xml` file which is located under `app/manage_travels/webapp/ext/main` folder

### Unknown property binding info

1. Copy and paste snippet `<Input value="{pat: ' ', mode:' ' }" id="test-id-02"/>`
2. Check that a diagnostic with message `Unknown property binding info` is reported

### Expect colon

1. Copy and paste snippet `<Input value="{path ' ', mode:' ' }" id="test-id-02"/>`
2. Check that a diagnostic with message `Expect colon` is reported

### Expect value

1. Copy and paste snippet `<Input value="{path: , mode:' ' }" id="test-id-02"/>`
2. Check that a diagnostic with message `Expect '' as a value` is reported

### Extra colon

1. Copy and paste snippet `<Input value="{path:: ' ', mode:' ' }" id="test-id-02"/>`
2. Check that a diagnostic with message `Too many colon` is reported

### Missing comma

1. Copy and paste snippet `<Input value="{path: ' '  mode:' ' }" id="test-id-02"/>`
2. Check that a diagnostic with message `Missing comma` is reported

### Extra comma

1. Copy and paste snippet `<Input value="{path: ' ',,,  mode:' ' }" id="test-id-02"/>`
2. Check that a diagnostic with message `Too many commas` is reported

### Trailing comma

1. Copy and paste snippet `<Input value="{path: ' ', mode:' ', }" id="test-id-02"/>`
2. Check that a diagnostic with message `Trailing comma` is reported
