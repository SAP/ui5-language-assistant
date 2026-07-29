sap.ui.define(["sap/ui/model/json/JSONModel"], function (JSONModel) {
  "use strict";
  return {
    onChartSelectionChanged: function (oEvent) {
      var oView = this.editFlow.getView();
      var oPopupModel = oView.getModel("popup");
      var oPopover = oEvent.getSource().getParent().getDependents()[0];
      if (oEvent.getParameter("selected")) {
        if (!oPopupModel) {
          oPopupModel = new JSONModel();
          oView.setModel(oPopupModel, "popup");
        }
        oPopupModel.setData(oEvent.getParameter("data")[0].data, true);
        // open popover at selected chart segment
        oPopover.openBy(oEvent.getParameter("data")[0].target);
      }
    },
  };
});
