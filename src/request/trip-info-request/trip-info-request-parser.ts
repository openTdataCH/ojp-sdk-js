import { Location } from "../../location/location";
import { PtSituationElement } from "../../situation/situation-element";
import { TripInfoResult } from "../../trip/trip-info/trip-info-result";
import { BaseParser } from "../base-parser";
import { TripInfoRequest_Callback as ParserCallback } from "../types/trip-info-request.type";

export class TripInfoRequestParser extends BaseParser {
  public tripInfoResult: TripInfoResult | null
  private mapContextLocations: Record<string, Location>;
  private mapContextSituations: Record<string, PtSituationElement>;
  public callback: ParserCallback | null = null;

  constructor() {
    super();

    this.tripInfoResult = null;
    this.mapContextLocations = {};
    this.mapContextSituations = {};
  }

  private reset() {
    this.tripInfoResult = null;
    this.mapContextLocations = {};
    this.mapContextSituations = {};
  }

  public parseXML(responseXMLText: string): void {
    this.reset();
    super.parseXML(responseXMLText);
  }

  protected onCloseTag(nodeName: string): void {
    if (nodeName === 'TripInfoResult') {
      const tripInfoResult = TripInfoResult.initFromTreeNode(this.currentNode);
      if (tripInfoResult) {
        tripInfoResult.patchLocations(this.mapContextLocations);
      }

      this.tripInfoResult = tripInfoResult;
    }

    if (nodeName === 'TripInfoResponseContext') {
      const placesTreeNode = this.currentNode.findChildNamed('Places');
      if (placesTreeNode) {
        this.mapContextLocations = {};
            
        const locationTreeNodes = placesTreeNode.findChildrenNamed('Place');
        locationTreeNodes.forEach(locationTreeNode => {
          const location = Location.initWithTreeNode(locationTreeNode);
          const stopPlaceRef = location.stopPlace?.stopPlaceRef ?? null;
          if (stopPlaceRef !== null) {
            this.mapContextLocations[stopPlaceRef] = location;
          }
        });
      }

      const situationsTreeNode = this.currentNode.findChildNamed('Situations');
      if (situationsTreeNode) {
        this.mapContextSituations = {};

        const situationTreeNodes = situationsTreeNode.findChildrenNamed('PtSituation');
        situationTreeNodes.forEach(situationTreeNode => {
          const situation = PtSituationElement.initWithSituationTreeNode(situationTreeNode);
          if (situation) {
            this.mapContextSituations[situation.situationNumber] = situation;
          }
        });
      }
    }
  }

  protected onEnd(): void {
    if (this.callback) {
      this.callback({
        tripInfoResult: this.tripInfoResult,
        message: 'TripInfoRequest.DONE',
      });
    }
  }
}
