import MessageBox from "sap/m/MessageBox";
import BaseController from "./BaseController";

/**
 * @namespace sap.demo.ui5typescripttutorialapp.controller
 */
export default class Main extends BaseController {
  public sayHello(): void {
    MessageBox.show("Hello World!");
  }
}
