class TextDocumentContentProvider {
  constructor() {
    //
  }
}

class EventEmitter {
  constructor(e) {
    this.eventHandler = new Set();
  }
  event(handler) {
    if (this._emitter) {
      this._emitter.eventHandler.add(handler);
    }
    return {
      dispose: () => {
        if (this._emitter) {
          this._emitter.eventHandler.delete(handler);
        }
      },
    };
  }
  fire(args) {
    for (const eh of Array.from(this.eventHandler)) {
      eh(args);
    }
  }
  dispose() {
    //
  }
}

const ExtensionContext = {
  asAbsolutePath: () => "",
};

const Uri = {};

const FormattingOptions = {
  tabSize: 4,
  insertSpaces: true,
};

class TextDocument {
  constructor() {
    this.text = "";
  }
  getText() {
    return this.text;
  }
  positionAt() {
    return new Position(0, 0);
  }
}

class Position {
  constructor(line, character) {
    this.line = line;
    this.character = character;
  }
}

class Location {
  constructor(uri, range) {
    this.uri = uri;
    this.range = range;
  }
}

class Range {
  constructor(startLine, startCharacter, endLine, endCharacter) {
    if (typeof startLine === "object") {
      // positions provided as objects
      this.start = startLine;
      this.end = startCharacter;
    } else {
      this.start = new Position(startLine, startCharacter);
      this.end = new Position(endLine, endCharacter);
    }
  }
}

const workspace = {
  getConfiguration: () => {
    return {
      get: () => jest.fn(),
    };
  },
};

const TextEdit = {
  replace: jest.fn(),
};

const window = {
  showErrorMessage: () => {},
};

module.exports = {
  TextDocumentContentProvider,
  EventEmitter,
  ExtensionContext,
  Uri,
  FormattingOptions,
  TextDocument,
  TextEdit,
  Position,
  Location,
  Range,
  workspace,
  window,
};
