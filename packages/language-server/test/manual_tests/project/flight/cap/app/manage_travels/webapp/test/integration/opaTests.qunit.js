sap.ui.require(
  [
    "sap/fe/test/JourneyRunner",
    "sap/fe/demo/managetravels/test/integration/FirstJourney",
    "sap/fe/demo/managetravels/test/integration/pages/TravelMain",
  ],
  function (JourneyRunner, opaJourney, TravelMain) {
    "use strict";
    var JourneyRunner = new JourneyRunner({
      // start index.html in web folder
      launchUrl:
        sap.ui.require.toUrl("sap/fe/demo/managetravels") + "/index.html",
    });

    JourneyRunner.run(
      {
        pages: {
          onTheTravelMain: TravelMain,
        },
      },
      opaJourney.run
    );
  }
);
