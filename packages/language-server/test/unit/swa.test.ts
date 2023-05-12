import {
  track,
  setGlobalSWA,
  $internalGetSWAImpl,
  ISWATracker,
  initSwa,
} from "../../src/swa";
import { SWATracker } from "@sap/swa-for-sapbas-vsx";

describe("The SWA 'Global' Wrapper", () => {
  let orgSwaImpl: ISWATracker;

  beforeEach(() => {
    orgSwaImpl = $internalGetSWAImpl();
  });

  afterEach(() => {
    setGlobalSWA(orgSwaImpl);
  });

  it("will expose a NO-OPERATION (safe to execute) SWA impl by default", () => {
    expect(() => {
      track("XML_UI5_DOC_HOVER", "bisli", "bamba");
    }).not.toThrow();
  });

  it("will enable setting a new global SWA Implementation", () => {
    const orgSwaImpl = $internalGetSWAImpl();
    const newSwaImpl = new SWATracker("osem", "bamba");
    setGlobalSWA(newSwaImpl);
    expect($internalGetSWAImpl()).toEqual(newSwaImpl);
    expect($internalGetSWAImpl()).not.toEqual(orgSwaImpl);
  });

  it("will init a 'real' SWA tracker only when the init params are provided", () => {
    const orgSwaImpl = $internalGetSWAImpl();
    expect($internalGetSWAImpl()).toEqual(orgSwaImpl);
    initSwa({
      initializationOptions: { publisher: "SAPOSS", name: "UI5-Lang-Assist" },
    });
    expect($internalGetSWAImpl()).not.toEqual(orgSwaImpl);
  });

  it("will **not** init a 'real' SWA tracker when the init params are not provided", () => {
    const orgSwaImpl = $internalGetSWAImpl();
    expect($internalGetSWAImpl()).toEqual(orgSwaImpl);
    initSwa({});
    expect($internalGetSWAImpl()).toEqual(orgSwaImpl);
  });
});
