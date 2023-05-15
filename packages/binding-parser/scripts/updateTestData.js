const { update } = require("../lib/test/helper/update-test-data");
update()
  .then(() => console.log("Tests updated"))
  .catch(console.error);
