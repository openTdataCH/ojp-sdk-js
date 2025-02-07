import { Location } from "../../location/location";
import { BaseParser } from "../base-parser";
import { LIR_Callback as ParserCallback } from "../types/location-information-request.type";

export class LocationInformationParser extends BaseParser {
  private locations: Location[];
  public callback: ParserCallback | null = null;

  constructor() {
    super();
    this.locations = [];
  }

  public parseXML(responseXMLText: string): void {
    this.locations = [];
    super.parseXML(responseXMLText);
  }

  protected onCloseTag(nodeName: string): void {
    if (nodeName === 'PlaceResult' && this.currentNode.parentName === 'OJPLocationInformationDelivery') {
      const location = Location.initWithLocationResultTreeNode(
        this.currentNode
      );

      if (location) {
        this.locations.push(location);
      }
    }
  }

  protected onError(saxError: any): void {
    console.error('ERROR: SAX parser');
    console.log(saxError);
    
    if (this.callback) {
      this.callback({
        locations: this.locations,
        message: 'ERROR',
      });
    }
  }

  protected onEnd(): void {
    if (this.callback) {
      this.callback({
        locations: this.locations,
        message: 'LocationInformation.DONE',
      });
    }
  }
}
