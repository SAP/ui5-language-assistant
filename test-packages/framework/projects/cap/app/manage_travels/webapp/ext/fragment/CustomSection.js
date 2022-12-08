sap.ui.define(["sap/ui/model/json/JSONModel"], function (JSONModel) {
  "use strict";

  return {
    onChartSelectionChanged: function (oEvent) {
      if (oEvent.getParameter("selected")) {
        this.editFlow
          .getView()
          .setModel(
            new JSONModel(oEvent.getParameter("data")[0].data),
            "popup"
          );

        // get Popover from xml fragment dependents
        this._oPopover = oEvent.getSource().getParent().getDependents()[0];
        if (this._oPopover) {
          // open popover at selected chart segment
          this._oPopover.openBy(oEvent.getParameter("data")[0].target);
        }
      }
    },
  };
});
