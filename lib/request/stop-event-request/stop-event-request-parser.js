import { DEBUG_LEVEL } from "../../constants";
import { Location } from "../../location/location";
import { PtSituationElement } from "../../situation/situation-element";
import { StopEvent } from "../../stop-event/stop-event";
import { BaseParser } from "../base-parser";
export class StopEventRequestParser extends BaseParser {
    constructor() {
        super();
        this.callback = null;
        this.stopEvents = [];
        this.mapContextLocations = {};
        this.mapContextSituations = {};
    }
    reset() {
        this.stopEvents = [];
        this.mapContextLocations = {};
        this.mapContextSituations = {};
    }
    parseXML(responseXMLText) {
        this.reset();
        super.parseXML(responseXMLText);
    }
    onCloseTag(nodeName) {
        if (nodeName === 'StopEventResult') {
            const stopEvent = StopEvent.initWithTreeNode(this.currentNode);
            if (stopEvent) {
                stopEvent.patchStopEventLocations(this.mapContextLocations);
                stopEvent.patchSituations(this.mapContextSituations);
                this.stopEvents.push(stopEvent);
            }
        }
        if (nodeName === 'StopEventResponseContext') {
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
                stopEvents: this.stopEvents,
                message: 'StopEvent.DONE',
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
        this.stopEvents.forEach(stopEvent => {
            stopEvent.stopPoint.siriSituations.forEach(serviceSituation => {
                if (serviceSituation.situationNumber in mapExpectedSituationIDs) {
                    mapExpectedSituationIDs[serviceSituation.situationNumber] = true;
                }
                else {
                    console.error('StopPoint has situation which can be found in context');
                    console.log(serviceSituation.situationNumber);
                    console.log(this.mapContextSituations);
                    console.log('======================================================================');
                }
            });
        });
        for (const situationNumber in mapExpectedSituationIDs) {
            if (mapExpectedSituationIDs[situationNumber] === false) {
                console.error('Situation ' + situationNumber + ' cant be map to any of the stop events');
                console.log(this.mapContextSituations[situationNumber]);
                console.log(this.stopEvents);
                console.log('======================================================================');
            }
        }
        this.stopEvents.forEach(stopEvent => {
            stopEvent.stopPoint.siriSituationIds.forEach(situationNumber => {
                if (situationNumber in mapExpectedSituationIDs) {
                    return;
                }
                console.error('Situation ' + situationNumber + ' is in the stopEvent but cant be found in the context');
                console.log(this.mapContextSituations);
                console.log(stopEvent.stopPoint);
                console.log('======================================================================');
            });
        });
    }
}
