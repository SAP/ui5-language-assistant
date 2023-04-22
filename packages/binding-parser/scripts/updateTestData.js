const { update } = require("../lib/test/utils/update-test-data");
update()
  .then(() => console.log("Tests updated"))
  .catch(console.error);
