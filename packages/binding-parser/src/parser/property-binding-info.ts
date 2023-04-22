import { CstParser } from "chevrotain";
import {
  ARRAY,
  OBJECT,
  OBJECT_ITEM,
  PROPERTY_BINDING_INFO,
  VALUE,
} from "../constant";
import { propertyBindingTokenMap as tokenMap } from "../lexer";

class PropertyBindingInfoParser extends CstParser {
  constructor() {
    super(tokenMap, {
      maxLookahead: 1,
      recoveryEnabled: true,
      nodeLocationTracking: "full",
      // This could reduce 30-50% of the initialization time
      // Enable validation for debugging
      skipValidations: true,
    });
    this.performSelfAnalysis();
  }
  [PROPERTY_BINDING_INFO] = this.RULE(PROPERTY_BINDING_INFO, () => {
    this.SUBRULE(this[OBJECT]);
  });

  [OBJECT] = this.RULE(OBJECT, () => {
    this.CONSUME(tokenMap.leftCurly);
    this.MANY_SEP({
      SEP: tokenMap.comma,
      DEF: () => {
        this.SUBRULE(this[OBJECT_ITEM]);
      },
    });
    this.CONSUME(tokenMap.rightCurly);
  });

  [OBJECT_ITEM] = this.RULE(OBJECT_ITEM, () => {
    this.CONSUME(tokenMap.key);
    this.CONSUME(tokenMap.colon);
    this.SUBRULE(this[VALUE]);
  });
  [VALUE] = this.RULE(VALUE, () => {
    this.OR([
      { ALT: () => this.CONSUME(tokenMap.stringValue) },
      { ALT: () => this.CONSUME(tokenMap.numberValue) },
      { ALT: () => this.SUBRULE(this[OBJECT]) },
      { ALT: () => this.SUBRULE(this[ARRAY]) },
      { ALT: () => this.CONSUME(tokenMap.booleanValue) },
      { ALT: () => this.CONSUME(tokenMap.nullValue) },
    ]);
  });

  [ARRAY] = this.RULE(ARRAY, () => {
    this.CONSUME(tokenMap.leftBracket);
    this.MANY_SEP({
      SEP: tokenMap.comma,
      DEF: () => {
        this.SUBRULE(this[VALUE]);
      },
    });
    this.CONSUME(tokenMap.rightBracket);
  });
}

export const propertyBindingInfoParser = new PropertyBindingInfoParser();
