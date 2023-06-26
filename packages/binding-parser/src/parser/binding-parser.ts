import { CstParser } from "chevrotain";
import type { CstNode, TokenType, IToken } from "chevrotain";
import { ARRAY, OBJECT, OBJECT_ITEM, TEMPLATE, VALUE } from "../constant";
import { bindingParserTokenMap as tokenMap } from "../lexer";

class BindingParser extends CstParser {
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
  [TEMPLATE] = this.RULE(TEMPLATE, () => {
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
        GATE: (): boolean =>
          this.LA(1).tokenType === tokenMap.key &&
          (this.LA(2).tokenType === tokenMap.stringValue ||
            this.LA(2).tokenType === tokenMap.numberValue ||
            this.LA(2).tokenType === tokenMap.leftCurly ||
            this.LA(2).tokenType === tokenMap.leftBracket ||
            this.LA(2).tokenType === tokenMap.booleanValue ||
            this.LA(2).tokenType === tokenMap.nullValue),
        ALT: (): void => {
          // colon is missing, but there is key and value
          this.CONSUME(tokenMap.key);
          this.SUBRULE(this[VALUE]);
        },
      },
      {
        GATE: (): boolean =>
          this.LA(1).tokenType === tokenMap.stringValue &&
          (this.LA(2).tokenType === tokenMap.stringValue ||
            this.LA(2).tokenType === tokenMap.numberValue ||
            this.LA(2).tokenType === tokenMap.leftCurly ||
            this.LA(2).tokenType === tokenMap.leftBracket ||
            this.LA(2).tokenType === tokenMap.booleanValue ||
            this.LA(2).tokenType === tokenMap.nullValue),
        ALT: (): void => {
          // colon is missing, but there is key with quotes and value
          this.CONSUME(tokenMap.stringValue);
          this.SUBRULE(this[VALUE]);
        },
      },
      {
        GATE: (): boolean => this.LA(1).tokenType === tokenMap.stringValue,
        ALT: (): void => {
          // key with quotes
          this.CONSUME(tokenMap.stringValue);
          this.OPTION1(() => {
            this.CONSUME(tokenMap.colon);
            this.SUBRULE(this[VALUE]);
          });
        },
      },
      {
        ALT: (): void => {
          this.CONSUME(tokenMap.key);
          this.OPTION1(() => {
            this.CONSUME(tokenMap.colon);
            this.SUBRULE(this[VALUE]);
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

export const bindingParser = new BindingParser();
