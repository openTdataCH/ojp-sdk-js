import { DEBUG_LEVEL } from "../../constants";
import { Location } from "../../location/location";
import { PtSituationElement } from "../../situation/situation-element";
import { Trip, TripTimedLeg } from "../../trip";
import { BaseParser } from "../base-parser";
import { TripRequest_Callback as ParserCallback } from "../types/trip-request.type";

export class TripRequestParser extends BaseParser {
  private trips: Trip[];
  private tripsNo: number;
  private mapContextLocations: Record<string, Location>;
  private mapContextSituations: Record<string, PtSituationElement>;
  public callback: ParserCallback | null = null;

  constructor() {
    super();

    this.trips = [];
    this.tripsNo = 0;
    this.mapContextLocations = {};
    this.mapContextSituations = {};
  }

  private reset() {
    this.trips = [];
    this.tripsNo = 0;
    this.mapContextLocations = {};
    this.mapContextSituations = {};
  }

  public parseXML(responseXMLText: string): void {
    this.reset();

    this.tripsNo = responseXMLText.split('<TripResult>').length - 1;
    if (this.tripsNo === 0) {
      // Handle ojp: NS in the server response
      this.tripsNo = responseXMLText.split('<ojp:TripResult>').length - 1;
    }

    if (this.callback) {
      this.callback({
        trips: this.trips,
        tripsNo: this.tripsNo,
        message: 'TripRequest.TripsNo',
      });
    }

    super.parseXML(responseXMLText);
  }

  protected onCloseTag(nodeName: string): void {
    if (nodeName === "Trip" && this.currentNode.parentName === "TripResult") {
      const trip = Trip.initFromTreeNode(this.currentNode);
      if (trip) {
        trip.legs.forEach((leg) => {
          leg.patchLocations(this.mapContextLocations);
          leg.patchSituations(this.mapContextSituations);
        });

        this.trips.push(trip);

        if (this.callback) {
          this.callback({
            tripsNo: this.tripsNo,
            trips: this.trips,
            message: 'TripRequest.Trip',
          });
        }
      }
    }

    if (nodeName === 'TripResponseContext') {
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
    if (DEBUG_LEVEL === 'DEBUG') {
      this.validateSituations();
    }

    if (this.callback) {
      this.callback({
        tripsNo: this.tripsNo,
        trips: this.trips,
        message: 'TripRequest.DONE',
      });
    }
  }

  private validateSituations() {
    const contextSituations = Object.values(this.mapContextSituations);
    if (contextSituations.length === 0) {
      return;
    }

    const mapExpectedSituationIDs: Record<string, boolean> = {};
    contextSituations.forEach(situation => {
      mapExpectedSituationIDs[situation.situationNumber] = false;
    });
    
    this.trips.forEach(trip => {
      trip.legs.forEach(leg => {
        if (leg.legType !== 'TimedLeg') {
          return;
        }

        const timedLeg = leg as TripTimedLeg;
        timedLeg.service.siriSituations.forEach(serviceSituation => {
          if (serviceSituation.situationNumber in mapExpectedSituationIDs) {
            mapExpectedSituationIDs[serviceSituation.situationNumber] = true;
          } else {
            console.error('TimedLeg has situation which can be found in context');
            console.log(serviceSituation.situationNumber);
            console.log(this.mapContextSituations);
            console.log('======================================================================');
          }
        });
      });
    });

    for (const situationNumber in mapExpectedSituationIDs) {
      if (mapExpectedSituationIDs[situationNumber] === false) {
        console.error('Situation ' + situationNumber + ' cant be map to any of the trips');
        console.log(this.mapContextSituations[situationNumber]);
        console.log(this.trips);
        console.log('======================================================================');
      }
    }

    this.trips.forEach(trip => {
      trip.legs.forEach(leg => {
        if (leg.legType !== 'TimedLeg') {
          return;
        }

        const timedLeg = leg as TripTimedLeg;
        timedLeg.service.siriSituationIds.forEach(situationNumber => {
          if ((situationNumber in mapExpectedSituationIDs)) {
            return;
          }

          console.error('Situation ' + situationNumber + ' is in the <Trip> but cant be found in the context');
          console.log(this.mapContextSituations);
          console.log(trip);
          console.log(timedLeg);
          console.log('======================================================================');
        });
      });
    });
  }
}
