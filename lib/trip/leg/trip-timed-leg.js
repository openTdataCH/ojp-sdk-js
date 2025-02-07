import { JourneyService } from '../../journey/journey-service';
import { StopPoint } from './timed-leg/stop-point';
import { LegTrack } from './leg-track';
import { TripLeg } from "./trip-leg";
export class TripTimedLeg extends TripLeg {
    constructor(legIDx, service, fromStopPoint, toStopPoint, intermediateStopPoints = []) {
        const legType = 'TimedLeg';
        super(legType, legIDx, fromStopPoint.location, toStopPoint.location);
        this.service = service;
        this.fromStopPoint = fromStopPoint;
        this.toStopPoint = toStopPoint;
        this.intermediateStopPoints = intermediateStopPoints;
    }
    static initWithTreeNode(legIDx, treeNode) {
        const service = JourneyService.initWithTreeNode(treeNode);
        if (service === null) {
            return null;
        }
        const fromStopTreeNode = treeNode.findChildNamed('LegBoard');
        const toStopTreeNode = treeNode.findChildNamed('LegAlight');
        if (fromStopTreeNode === null || toStopTreeNode === null) {
            return null;
        }
        const fromStopPoint = StopPoint.initWithTreeNode(fromStopTreeNode, 'From');
        const toStopPoint = StopPoint.initWithTreeNode(toStopTreeNode, 'To');
        if (fromStopPoint === null || toStopPoint === null) {
            return null;
        }
        const intermediateStopPoints = [];
        const intermediaryStopTreeNodes = treeNode.findChildrenNamed('LegIntermediate');
        intermediaryStopTreeNodes.forEach(intermediaryStopTreeNode => {
            const stopPoint = StopPoint.initWithTreeNode(intermediaryStopTreeNode, 'Intermediate');
            if (stopPoint) {
                intermediateStopPoints.push(stopPoint);
            }
        });
        const timedLeg = new TripTimedLeg(legIDx, service, fromStopPoint, toStopPoint, intermediateStopPoints);
        timedLeg.legTrack = LegTrack.initWithLegTreeNode(treeNode);
        if (timedLeg.legTrack && timedLeg.legDuration === null) {
            timedLeg.legDuration = timedLeg.legTrack.duration;
        }
        return timedLeg;
    }
    patchLocations(mapContextLocations) {
        super.patchLocations(mapContextLocations);
        this.intermediateStopPoints.forEach(stopPoint => {
            this.patchLocation(stopPoint.location, mapContextLocations);
        });
    }
    computeDepartureTime() {
        return this.computeStopPointTime(this.fromStopPoint.departureData);
    }
    computeArrivalTime() {
        return this.computeStopPointTime(this.toStopPoint.arrivalData);
    }
    computeStopPointTime(timeData) {
        var _a;
        if (timeData === null) {
            return null;
        }
        const stopPointDate = (_a = timeData.estimatedTime) !== null && _a !== void 0 ? _a : timeData.timetableTime;
        return stopPointDate;
    }
    patchSituations(mapContextSituations) {
        this.service.siriSituations = [];
        this.service.siriSituationIds.forEach(siriSituationId => {
            var _a;
            const siriSituation = (_a = mapContextSituations[siriSituationId]) !== null && _a !== void 0 ? _a : null;
            if (siriSituation) {
                this.service.siriSituations.push(siriSituation);
            }
        });
    }
    addToXMLNode(parentNode) {
        const tripLegNode = parentNode.ele('ojp:TripLeg');
        tripLegNode.ele('ojp:LegId', this.legID);
        const timedLeg = tripLegNode.ele('ojp:TimedLeg');
        const boardingTypes = ['Arr', 'Dep'];
        const addStopPoint = (stopPoint, stopPointType) => {
            var _a;
            const legEndpointName = (() => {
                if (stopPointType === 'From') {
                    return 'ojp:LegBoard';
                }
                if (stopPointType === 'To') {
                    return 'ojp:LegAlight';
                }
                return 'ojp:LegIntermediates';
            })();
            const legEndpoint = timedLeg.ele(legEndpointName);
            const stopPlace = stopPoint.location.stopPlace;
            if (stopPlace) {
                legEndpoint.ele('StopPointRef', stopPlace.stopPlaceRef);
                legEndpoint.ele('ojp:StopPointName').ele('ojp:Text', (_a = stopPlace.stopPlaceName) !== null && _a !== void 0 ? _a : 'n/a');
            }
            boardingTypes.forEach(boardingType => {
                const isArrival = boardingType === 'Arr';
                const serviceDepArrData = isArrival ? stopPoint.arrivalData : stopPoint.departureData;
                if (serviceDepArrData) {
                    const serviceDepArrName = isArrival ? 'ojp:ServiceArrival' : 'ojp:ServiceDeparture';
                    legEndpoint.ele(serviceDepArrName).ele('ojp:TimetabledTime', serviceDepArrData.timetableTime.toISOString());
                }
            });
        };
        addStopPoint(this.fromStopPoint, 'From');
        this.intermediateStopPoints.forEach(stopPoint => {
            addStopPoint(stopPoint, 'Intermediate');
        });
        addStopPoint(this.toStopPoint, 'To');
        this.service.addToXMLNode(timedLeg);
    }
}
