import { expect } from "chai";
import {
  ConfigurationChangeEvent,
  Disposable,
  Event,
  WorkspaceConfiguration,
} from "vscode";
import {
  listenToLogLevelChanges,
  LOGGING_LEVEL_CONFIG_PROP,
} from "../../src/configuration";

describe("configuration changes handling spec", () => {
  let changeLogLevelRequestSent;
  let configChangeEventHandler: Parameters<Event<ConfigurationChangeEvent>>[0];

  beforeEach(() => {
    // "mocking" the VSCode related APIs vs DI.
    changeLogLevelRequestSent = false;
    const subscriptions = [];
    listenToLogLevelChanges({
      getConfiguration(): WorkspaceConfiguration {
        // @ts-expect-error -- in our scenario only `get` is needed.
        return new Map(
          Object.entries({ [LOGGING_LEVEL_CONFIG_PROP]: "off" })
        ) as WorkspaceConfiguration;
      },
      onDidChangeConfiguration: (
        eventHandler: (e: ConfigurationChangeEvent) => Disposable
      ) => {
        configChangeEventHandler = eventHandler;
        return {
          dispose: () => {
            console.log("noop");
          },
        };
      },
      // @ts-expect-error -- we are intentionally **not** making the `sendRequest` synchronized
      //   (signature mismatch...) to simplify the test`
      sendRequest(
        method: string,
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any -- signature with `any` originates from VSCode APIs */
        param: any
      ): void {
        changeLogLevelRequestSent = true;
        expect(method).to.equal("changeLogLevel");
        expect(param).to.equal("off");
      },
      subscriptions,
    });
  });

  it("will listen to configuration changes when the property is affected", () => {
    const changeConfigEvent = {
      affectsConfiguration: (section: string) => {
        expect(section).to.equal(LOGGING_LEVEL_CONFIG_PROP);
        return true;
      },
    };
    configChangeEventHandler(changeConfigEvent);
    expect(changeLogLevelRequestSent).to.be.true;
  });

  it("will **not** listen to configuration changes when the property is **not** affected", () => {
    const changeConfigEvent = {
      affectsConfiguration: (section: string) => {
        expect(section).to.equal(LOGGING_LEVEL_CONFIG_PROP);
        return false;
      },
    };
    configChangeEventHandler(changeConfigEvent);
    expect(changeLogLevelRequestSent).to.be.false;
  });
});
