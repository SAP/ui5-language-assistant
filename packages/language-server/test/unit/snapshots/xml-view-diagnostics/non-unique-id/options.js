const url = require("url");

const controlIds = new Map();

controlIds.set("OOPS", [
  {
    uri: url.pathToFileURL("").toString(),
    range: {
      start: { line: 3, character: 11 },
      end: { line: 3, character: 17 },
    },
    offsetRange: { start: 79, end: 84 },
  },
  {
    uri: url.pathToFileURL("").toString(),
    range: {
      start: { line: 5, character: 13 },
      end: { line: 5, character: 19 },
    },
    offsetRange: { start: 109, end: 114 },
  },
]);

module.exports = { flexEnabled: false, controlIds };
