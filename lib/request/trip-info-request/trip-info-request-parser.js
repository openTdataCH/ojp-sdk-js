import { Location } from "../../location/location";
import { PtSituationElement } from "../../situation/situation-element";
import { TripInfoResult } from "../../trip/trip-info/trip-info-result";
import { BaseParser } from "../base-parser";
export class TripInfoRequestParser extends BaseParser {
    constructor() {
        super();
        this.callback = null;
        this.tripInfoResult = null;
        this.mapContextLocations = {};
        this.mapContextSituations = {};
    }
    reset() {
        this.tripInfoResult = null;
        this.mapContextLocations = {};
        this.mapContextSituations = {};
    }
    parseXML(responseXMLText) {
        this.reset();
        super.parseXML(responseXMLText);
    }
    onCloseTag(nodeName) {
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
        if (this.callback) {
            this.callback({
                tripInfoResult: this.tripInfoResult,
                message: 'TripInfoRequest.DONE',
            });
        }
    }
}
