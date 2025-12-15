class TextDocumentContentProvider {
  constructor() {
    //
  }
}

class EventEmitter {
  constructor(e) {
    this.eventHandler = new Set();
    // Bind the event method to preserve context
    this.event = this.event.bind(this);
  }
  event(handler) {
    this.eventHandler.add(handler);
    return {
      dispose: () => {
        this.eventHandler.delete(handler);
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

const Uri = {
  parse: (value) => ({
    scheme: value.split("://")[0],
    path: value.split("://")[1] || "",
    fsPath: value,
    toString: () => value,
  }),
};

const FormattingOptions = {
  tabSize: 4,
  insertSpaces: true,
};

class SemanticTokens {
  constructor() {}
}
class SemanticTokensBuilder {
  constructor() {}
  tokens = [];
  push(line, char, length, tokenType, tokenModifiers) {
    // dummy implementation for test only
    this.tokens.push({ line, char, length, tokenType, tokenModifiers });
  }
  build() {
    // dummy implementation for test only
    return this.tokens;
  }
}
class DocumentSemanticTokensProvider {
  provideDocumentSemanticTokens() {
    return Promise.resolve(() => []);
  }
}
class SemanticTokensLegend {}
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
  get activeTextEditor() {
    return this._activeTextEditor;
  },
  _activeTextEditor: {
    document: {
      uri: { fsPath: "/path/to/file.js" },
    },
  },
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
  SemanticTokens,
  SemanticTokensBuilder,
  DocumentSemanticTokensProvider,
  SemanticTokensLegend,
};
