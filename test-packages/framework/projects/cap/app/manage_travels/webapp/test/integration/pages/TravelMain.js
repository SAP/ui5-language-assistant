sap.ui.define(["sap/fe/test/TemplatePage"], function (TemplatePage) {
  "use strict";

  var CustomPageDefinitions = {
    actions: {},
    assertions: {},
  };

  return new TemplatePage(
    "sap.fe.demo.managetravels::TravelMain",
    CustomPageDefinitions
  );
});
