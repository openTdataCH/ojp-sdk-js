import { DEBUG_LEVEL } from "../../constants";
import { Location } from "../../location/location";
import { PtSituationElement } from "../../situation/situation-element";
import { Trip } from "../../trip";
import { BaseParser } from "../base-parser";
export class TripRequestParser extends BaseParser {
    constructor() {
        super();
        this.callback = null;
        this.trips = [];
        this.tripsNo = 0;
        this.mapContextLocations = {};
        this.mapContextSituations = {};
    }
    reset() {
        this.trips = [];
        this.tripsNo = 0;
        this.mapContextLocations = {};
        this.mapContextSituations = {};
    }
    parseXML(responseXMLText) {
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
    onCloseTag(nodeName) {
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
                    var _a, _b;
                    const location = Location.initWithTreeNode(locationTreeNode);
                    const stopPlaceRef = (_b = (_a = location.stopPlace) === null || _a === void 0 ? void 0 : _a.stopPlaceRef) !== null && _b !== void 0 ? _b : null;
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
    onEnd() {
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
    validateSituations() {
        const contextSituations = Object.values(this.mapContextSituations);
        if (contextSituations.length === 0) {
            return;
        }
        const mapExpectedSituationIDs = {};
        contextSituations.forEach(situation => {
            mapExpectedSituationIDs[situation.situationNumber] = false;
        });
        this.trips.forEach(trip => {
            trip.legs.forEach(leg => {
                if (leg.legType !== 'TimedLeg') {
                    return;
                }
                const timedLeg = leg;
                timedLeg.service.siriSituations.forEach(serviceSituation => {
                    if (serviceSituation.situationNumber in mapExpectedSituationIDs) {
                        mapExpectedSituationIDs[serviceSituation.situationNumber] = true;
                    }
                    else {
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
                const timedLeg = leg;
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
