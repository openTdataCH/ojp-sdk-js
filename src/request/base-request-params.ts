import * as xmlbuilder from "xmlbuilder";

import { SDK_VERSION } from '../constants';
import { Language } from "../types/language-type";

export class BaseRequestParams {
  private language: Language;
  protected serviceRequestNode: xmlbuilder.XMLElement;

  constructor(language: Language) {
    this.language = language
    this.serviceRequestNode = this.computeBaseServiceRequestNode();
  }
  
  private computeBaseServiceRequestNode(): xmlbuilder.XMLElement {
    const ojpNode = xmlbuilder.create("OJP", {
      version: "1.0",
      encoding: "utf-8",
    });

    ojpNode.att("xmlns", "http://www.vdv.de/ojp");
    ojpNode.att("xmlns:siri", "http://www.siri.org.uk/siri");
    ojpNode.att("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
    ojpNode.att("xmlns:xsd", "http://www.w3.org/2001/XMLSchema");
    ojpNode.att("xsi:schemaLocation", "http://www.vdv.de/ojp");
    ojpNode.att("version", "2.0");

    const serviceRequestNode = ojpNode
      .ele("OJPRequest")
      .ele("siri:ServiceRequest");

    serviceRequestNode.ele('siri:ServiceRequestContext').ele('siri:Language', this.language);

    return serviceRequestNode;
  }

  public static buildRequestorRef() {
    return "OJP_JS_SDK_v" + SDK_VERSION;
  }

  protected buildRequestNode() {
    this.serviceRequestNode = this.computeBaseServiceRequestNode();
  }

  public buildRequestXML(): string {
    this.buildRequestNode();
    const bodyXML_s = this.serviceRequestNode.end({
      pretty: true
    });

    return bodyXML_s;
  }
}
