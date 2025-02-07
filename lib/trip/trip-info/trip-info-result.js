import { DEBUG_LEVEL } from "../../constants";
import { DataHelpers } from "../../helpers/data-helpers";
import { JourneyService } from "../../journey/journey-service";
import { StopPoint } from "../leg/timed-leg/stop-point";
export class TripInfoResult {
    constructor(stopPoints, service, metadata) {
        this.stopPoints = stopPoints;
        this.service = service;
        this.metadata = metadata;
    }
    static initFromTreeNode(treeNode) {
        var _a, _b, _c;
        const serviceNode = treeNode.findChildNamed('Service');
        if (serviceNode === null) {
            console.error('TripInfoResult.initFromTreeNode: no service node found');
            console.log(treeNode);
            return null;
        }
        const service = JourneyService.initWithTreeNode(treeNode);
        if (service === null) {
            console.error('JourneyService.initFromTreeNode: cant init service');
            console.log(serviceNode);
            return null;
        }
        const previousCallNodes = treeNode.findChildrenNamed('PreviousCall');
        const onwardCallNodes = treeNode.findChildrenNamed('OnwardCall');
        const callNodes = previousCallNodes.concat(onwardCallNodes);
        const stopPoints = [];
        callNodes.forEach(callNode => {
            const stopPoint = StopPoint.initWithTreeNode(callNode, 'Intermediate');
            if (stopPoint !== null) {
                stopPoints.push(stopPoint);
            }
        });
        if (stopPoints.length < 2) {
            console.error('TripInfoResult.initFromTreeNode: expected minimum 2 stops');
            console.log(treeNode);
            return null;
        }
        const metadata = {
            transportTypeName: (_a = treeNode.findTextFromChildNamed('Extension/TransportTypeName/Text')) !== null && _a !== void 0 ? _a : 'TransportTypeName n/a',
            publishedJourneyNumber: (_b = treeNode.findTextFromChildNamed('Extension/PublishedJourneyNumber/Text')) !== null && _b !== void 0 ? _b : 'PublishedJourneyNumber n/a',
            operatorName: (_c = treeNode.findTextFromChildNamed('Extension/OperatorName/Text')) !== null && _c !== void 0 ? _c : 'OperatorName n/a',
        };
        const tripInfoResult = new TripInfoResult(stopPoints, service, metadata);
        return tripInfoResult;
    }
    patchLocations(mapContextLocations) {
        this.stopPoints.forEach(stopPoint => {
            var _a, _b;
            let stopPlaceRef = (_b = (_a = stopPoint.location.stopPlace) === null || _a === void 0 ? void 0 : _a.stopPlaceRef) !== null && _b !== void 0 ? _b : null;
            if (stopPlaceRef === null) {
                if (DEBUG_LEVEL === 'DEBUG') {
                    console.error('TripInfoResult.patchLocations - no stopPlaceRef found in location');
                    console.log(stopPoint);
                }
                return;
            }
            if (!(stopPlaceRef in mapContextLocations)) {
                // For StopPoint try to get the StopPlace
                // see https://github.com/openTdataCH/ojp-sdk/issues/97
                stopPlaceRef = DataHelpers.convertStopPointToStopPlace(stopPlaceRef);
            }
            if (!(stopPlaceRef in mapContextLocations)) {
                if (DEBUG_LEVEL === 'DEBUG') {
                    console.error('TripInfoResult.patchLocations - no stopPlaceRef found in mapContextLocations');
                    console.log('stopPoint:');
                    console.log(stopPoint);
                    console.log('mapContextLocations:');
                    console.log(mapContextLocations);
                }
                return;
            }
            const contextLocation = mapContextLocations[stopPlaceRef];
            stopPoint.location.patchWithAnotherLocation(contextLocation);
        });
    }
}
