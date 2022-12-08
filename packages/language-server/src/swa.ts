import { SWATracker } from "@sap/swa-for-sapbas-vsx";
import { InitializeParams } from "vscode-languageserver";
import { getLogger } from "./logger";

export type ISWATracker = Pick<SWATracker, "track">;

const SWA_NOOP: ISWATracker = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  track(eventType: string, custom_events?: string[]): void {},
};
Object.freeze(SWA_NOOP);

let SWA_IMPL = SWA_NOOP;

/**
 * only to be used during tests
 */
export function $internalGetSWAImpl(): ISWATracker {
  return SWA_IMPL;
}

export function setGlobalSWA(newSWA: ISWATracker): void {
  SWA_IMPL = newSWA;
}

export function initSwa(
  params: Pick<InitializeParams, "initializationOptions">
): void {
  if (params?.initializationOptions) {
    const { publisher, name } = params.initializationOptions;
    if (publisher !== undefined && name !== undefined) {
      getLogger().info("SWA is being initialized", {
        publisher,
        name,
      });
      // Currently ("@sap/swa-for-sapbas-vsx": "1.1.5") would not perform any usage analytics
      // when running inside an Language Server process which was initialized from VSCode.
      // It would only run in BAS.
      const swa = new SWATracker(publisher, name, (err) => {
        getLogger().error("Failure during SWA tracking", {
          error: err,
        });
      });
      setGlobalSWA(swa);
    }
  }
}

export const TRACK_EVENTS = {
  MANIFEST_STABLE_ID: "manifest stable ID fix",
  XML_UI5_DOC_HOVER: "XML UI5 Doc Hover",
};

Object.freeze(TRACK_EVENTS);

type TrackEventsKeys = keyof typeof TRACK_EVENTS;

export function track(
  eventType: TrackEventsKeys,
  ...custom_events: string[]
): void {
  try {
    SWA_IMPL.track(TRACK_EVENTS[eventType], custom_events);
  } catch (e) {
    /* istanbul ignore next -- extremely difficult to test this edge case as `.track()` is never supposed to throw */
    getLogger().error("Runtime Exception during swa.trace()", {
      error: e,
    });
  }
}
