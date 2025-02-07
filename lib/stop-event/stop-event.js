import { DEBUG_LEVEL } from '../constants';
import { DataHelpers } from '../helpers/data-helpers';
import { StopPoint } from '../trip/leg/timed-leg/stop-point';
import { JourneyService } from '../journey/journey-service';
export class StopEvent {
    constructor(stopPoint, journeyService) {
        this.stopPoint = stopPoint;
        this.journeyService = journeyService;
        this.prevStopPoints = [];
        this.nextStopPoints = [];
    }
    static initWithTreeNode(treeNode) {
        const stopEventTreeNode = treeNode.findChildNamed('StopEvent');
        if (stopEventTreeNode === null) {
            return null;
        }
        const currentStopTreeNode = stopEventTreeNode.findChildNamed('ThisCall/CallAtStop');
        if (currentStopTreeNode === null) {
            return null;
        }
        const stopPoint = StopPoint.initWithTreeNode(currentStopTreeNode, 'Intermediate');
        if (stopPoint === null) {
            return null;
        }
        const journeyService = JourneyService.initWithTreeNode(stopEventTreeNode);
        if (journeyService === null) {
            return null;
        }
        const stopEvent = new StopEvent(stopPoint, journeyService);
        const tripNodeTypes = ['PreviousCall', 'OnwardCall'];
        tripNodeTypes.forEach(tripNodeType => {
            const is_previous = tripNodeType === 'PreviousCall';
            const stopPointsRef = is_previous ? stopEvent.prevStopPoints : stopEvent.nextStopPoints;
            const groupStopsTreeNodes = stopEventTreeNode.findChildrenNamed(tripNodeType);
            groupStopsTreeNodes.forEach(groupStopsTreeNode => {
                const tripStopPointNode = groupStopsTreeNode.findChildNamed('CallAtStop');
                if (tripStopPointNode === null) {
                    return;
                }
                const tripStopPoint = StopPoint.initWithTreeNode(tripStopPointNode, 'Intermediate');
                if (tripStopPoint) {
                    stopPointsRef.push(tripStopPoint);
                }
            });
        });
        return stopEvent;
    }
    patchStopEventLocations(mapContextLocations) {
        let stopPointsToPatch = [this.stopPoint];
        const stopPointEventTypes = ['prev', 'next'];
        stopPointEventTypes.forEach(stopPointEventType => {
            const is_previous = stopPointEventType === 'prev';
            let stopPointsRef = is_previous ? this.prevStopPoints : this.nextStopPoints;
            stopPointsToPatch = stopPointsToPatch.concat(stopPointsRef);
        });
        stopPointsToPatch.forEach(stopPoint => {
            var _a, _b;
            let stopRef = (_b = (_a = stopPoint.location.stopPlace) === null || _a === void 0 ? void 0 : _a.stopPlaceRef) !== null && _b !== void 0 ? _b : null;
            if (stopRef === null) {
                if (DEBUG_LEVEL === 'DEBUG') {
                    console.error('StopEvent.patchStopEventLocations - no stopPlaceRef found in location');
                    console.log(stopPoint);
                }
                return;
            }
            if (!(stopRef in mapContextLocations)) {
                // For StopPoint try to get the StopPlace
                // see https://github.com/openTdataCH/ojp-sdk/issues/97
                stopRef = DataHelpers.convertStopPointToStopPlace(stopRef);
            }
            if (!(stopRef in mapContextLocations)) {
                if (DEBUG_LEVEL === 'DEBUG') {
                    console.error('StopEvent.patchLocation - no stopPlaceRef found in mapContextLocations');
                    console.log(stopPoint);
                    console.log('location.stopPlace?.stopPlaceRef :' + stopRef);
                    console.log(mapContextLocations);
                }
                return;
            }
            const contextLocation = mapContextLocations[stopRef];
            stopPoint.location.patchWithAnotherLocation(contextLocation);
        });
    }
    patchSituations(mapContextSituations) {
        this.stopPoint.siriSituations = [];
        const siriSituationIds = this.stopPoint.siriSituationIds.concat(this.journeyService.siriSituationIds);
        siriSituationIds.forEach(siriSituationId => {
            var _a;
            const siriSituation = (_a = mapContextSituations[siriSituationId]) !== null && _a !== void 0 ? _a : null;
            if (siriSituation) {
                this.stopPoint.siriSituations.push(siriSituation);
            }
        });
    }
}
