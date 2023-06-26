const { update } = require("../lib/test/unit/helper/update-test-data");
update()
  .then(() => console.log("Tests updated"))
  .catch(console.error);
