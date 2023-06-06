import { CstParser } from "chevrotain";
import type { CstNode, TokenType, IToken } from "chevrotain";
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
    this.MANY(() => {
      this.SUBRULE(this[OBJECT]);
    });
  });

  [OBJECT] = this.RULE(OBJECT, () => {
    this.CONSUME(tokenMap.leftCurly);
    this.OPTION(() => {
      this.CUSTOM_MANY(tokenMap.rightCurly, this[OBJECT_ITEM]);
    });
    this.CONSUME(tokenMap.rightCurly);
  });

  [OBJECT_ITEM] = this.RULE(OBJECT_ITEM, () => {
    this.OR([
      {
        GATE: (): boolean => this.LA(1).tokenType === tokenMap.colon,
        ALT: (): void => {
          // key is missing, but there is colon
          this.CONSUME(tokenMap.colon);
          this.SUBRULE(this[VALUE]);
        },
      },
      {
        ALT: (): void => {
          this.CONSUME1(tokenMap.key);
          this.OPTION1(() => {
            this.CONSUME2(tokenMap.colon);
            this.SUBRULE2(this[VALUE]);
          });
        },
      },
    ]);
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
    this.OPTION(() => {
      this.CUSTOM_MANY(tokenMap.rightBracket, this[VALUE]);
    });
    this.CONSUME(tokenMap.rightBracket);
  });

  CUSTOM_MANY(
    endToken: TokenType,
    repetitionRule: <T>(idxInCallingRule?: number, ...args: T[]) => CstNode
  ): void {
    this.MANY(() => {
      // workaround for https://github.com/SAP/chevrotain/issues/1200 once it is fixed we can use empty alternative
      this.OR([
        {
          GATE: (): boolean =>
            this.LA(1).tokenType === tokenMap.comma &&
            (this.LA(2).tokenType === endToken ||
              this.LA(2).tokenType === tokenMap.comma),
          ALT: (): IToken => this.CONSUME2(tokenMap.comma),
        },
        {
          GATE: (): boolean =>
            this.LA(1).tokenType === tokenMap.comma &&
            this.LA(2).tokenType !== endToken,
          ALT: (): void => {
            this.CONSUME3(tokenMap.comma);
            this.SUBRULE(repetitionRule);
          },
        },
        {
          ALT: (): CstNode => this.SUBRULE1(repetitionRule),
        },
      ]);
    });
  }
}

export const propertyBindingInfoParser = new PropertyBindingInfoParser();
