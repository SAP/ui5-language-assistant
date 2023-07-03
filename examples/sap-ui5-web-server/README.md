# Setup UI5 Local Web Server

1. Download [sap-ui5-web-server](https://github.com/SAP/ui5-language-assistant/blob/master/examples/sap-ui5-web-server/sap-ui5-web-server.zip) and unzip `sap-ui5-web-server`
2. Download [SDK](https://tools.hana.ondemand.com/#sapui5).

   **Note:** Check `minUI5Version` specified in `manifest.json` file of your project and download that **SDK** version

   **Note:** Please pay attention that there are two options **Runtime** and **SDK** for download. **SDK** _MUST_ be downloaded

3. Unzip the downloaded version to `sdks` folder of `sap-ui5-web-server`
4. Open `src/server.js` from `sap-ui5-web-server` in editor of your choice e.g. VSCode
5. Replace `<version>` with downloaded version and `<downloaded-sdk-folder>` with folder name unzip in `sdks`
6. Open a terminal and navigate to `sap-ui5-web-server`. Run `npm install`
7. After installation finished, type `npm run start`

   **Note:** Check in terminal a message "http://localhost:3000 is up and running" appears

**Example**

Lets assume that `minUI5Version` in `manifest.json` is ` 1.111.1` and you have downloaded `sapui5-sdk-1.111.1.zip` and unzip it as `sapui5-sdk-1.111.1` under `sdks` folder. `sdks` folder looks like `sdks/sapui5-sdk-1.111.1`

Replacing `<version>` and `<downloaded-sdk-folder>` looks like

`["/1.111.1", path.join(base, "sapui5-sdk-1.111.1")],`

in `server.js` file
