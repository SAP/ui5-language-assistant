sap.ui.define(["sap/fe/core/AppComponent"], function (Component) {
  "use strict";

  var oConnectorConfiguration = [{ connector: "SessionStorageConnector" }];
  sap.ui
    .getCore()
    .getConfiguration()
    .setFlexibilityServices(oConnectorConfiguration);

  return Component.extend("sap.fe.cap.managetravels.Component", {
    metadata: {
      manifest: "json",
    },
  });
});
