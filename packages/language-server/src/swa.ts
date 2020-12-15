import { SWATracker } from "@sap/swa-for-sapbas-vsx";
import { InitializeParams } from "vscode-languageserver";

export type ISWATracker = Pick<SWATracker, "track">;

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
    getSWA().track(TRACK_EVENTS[eventType], custom_events);
  } catch (e) {
    console.error(`failed usage analytics tracking: ${e.message}`);
  }
}

const SWA_NOOP: ISWATracker = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  track(eventType: string, custom_events?: string[]): void {},
};

let SWA_IMPL = SWA_NOOP;

export function setGlobalSWA(newSWA: ISWATracker): void {
  SWA_IMPL = newSWA;
}

export function getSWA(): ISWATracker {
  return SWA_IMPL;
}

export function initSwa(params: InitializeParams): void {
  if (params?.initializationOptions) {
    const { publisher, name } = params.initializationOptions;
    if (publisher !== undefined && name !== undefined) {
      // Currently ("@sap/swa-for-sapbas-vsx": "1.1.5") would not perform any usage analytics
      // when running inside an Language Server process which was initialized from VSCode.
      // It would only run in BAS.
      const swa = new SWATracker(publisher, name, (err) => {
        // Currently this would get sent to the client's output channel when
        // running via the UI5-Lang-Assistant VSCode ext.
        console.error(err);
      });
      setGlobalSWA(swa);
    }
  }
}
