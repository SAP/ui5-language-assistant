sap.ui.define(
  ["sap/fe/core/PageController", "sap/ui/model/json/JSONModel"],
  function (PageController, JSONModel, Routing) {
    "use strict";

    return PageController.extend("sap.fe.demo.managetravels.ext.main.Main", {
      handlers: {
        onFiltersChanged: function (oEvent) {
          var oSource = oEvent.getSource();
          var mFBConditions = oSource.getModel("fbConditions");
          mFBConditions.setProperty(
            "/filtersTextInfo",
            oSource.getActiveFiltersText()
          );
        },
        onPressed: function (oEvent) {
          var oContext = oEvent.getSource().getBindingContext();
          this.routing.navigateToRoute("TravelObjectPage", {
            TravelKey: `${oContext.getProperty("TravelID")}`,
          });
        },
      },
      /**
       * Called when a controller is instantiated and its View controls (if available) are already created.
       * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
       * @memberOf sap.fe.demo.managetravels.ext.main.Main
       */
      onInit: function () {
        PageController.prototype.onInit.apply(this);
        this.getView().getModel("ui").setProperty("/isEditable", true);
      },

      /**
       * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
       * (NOT before the first rendering! onInit() is used for that one!).
       * @memberOf sap.fe.demo.managetravels.ext.main.Main
       */
      //  onBeforeRendering: function() {
      //
      //  },

      /**
       * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
       * This hook is the same one that SAPUI5 controls get after being rendered.
       * @memberOf sap.fe.demo.managetravels.ext.main.Main
       */
      onAfterRendering: function (oEvent) {
        var oView = this.getView();
        var mFBConditions = new JSONModel({
          searched: "",
          inFilterBar: "",
          expanded: false,
          filtersTextInfo: oView.byId("FilterBar").getActiveFiltersText(),
        });
        oView.setModel(mFBConditions, "fbConditions");
        // this.getView().byId("container1").getBinding().refresh();
      },

      /**
       * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
       * @memberOf sap.fe.demo.managetravels.ext.main.Main
       */
      //  onExit: function() {
      //
      //  }
    });
  }
);
