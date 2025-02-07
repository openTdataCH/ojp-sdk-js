import { TripLegFactory } from './leg/trip-leg-factory';
import { TripTimedLeg } from './leg/trip-timed-leg';
import { Duration } from '../shared/duration';
import { DEBUG_LEVEL } from '../constants';
export class Trip {
    constructor(tripID, legs, tripStats) {
        this.id = tripID;
        this.legs = legs;
        this.stats = tripStats;
        this.tripFareResults = [];
    }
    static initFromTreeNode(treeNode) {
        let tripId = treeNode.findTextFromChildNamed('Id');
        // HACK for solution demo, backend sometimes delivers Trip with empty Id
        // TODO: revert when backend is ready, DONT merge to main
        if (tripId === null) {
            tripId = 'RandomTripId';
            if (DEBUG_LEVEL === 'DEBUG') {
                console.error('Trip.initFromTreeNode: No Id node found for trip, assigning a random one');
                console.log(treeNode);
                console.log('=======================================');
            }
        }
        const duration = Duration.initFromDurationText(treeNode.findTextFromChildNamed('Duration'));
        if (duration === null) {
            return null;
        }
        const transfersNoS = treeNode.findTextFromChildNamed('Transfers');
        if (transfersNoS === null) {
            return null;
        }
        const tripStartTimeS = treeNode.findTextFromChildNamed('StartTime');
        const tripEndTimeS = treeNode.findTextFromChildNamed('EndTime');
        if (tripStartTimeS === null || tripEndTimeS === null) {
            return null;
        }
        const tripStartTime = new Date(Date.parse(tripStartTimeS));
        const tripEndTime = new Date(Date.parse(tripEndTimeS));
        const legs = [];
        let tripLegsTotalDistance = 0;
        const tripLegTreeNodes = treeNode.findChildrenNamed('Leg');
        tripLegTreeNodes.forEach(tripLegTreeNode => {
            var _a, _b;
            const tripLeg = TripLegFactory.initWithTreeNode(tripLegTreeNode);
            if (tripLeg === null) {
                return;
            }
            const legTrackSections = (_b = (_a = tripLeg.legTrack) === null || _a === void 0 ? void 0 : _a.trackSections) !== null && _b !== void 0 ? _b : [];
            legTrackSections.forEach(legTrackSection => {
                var _a;
                tripLegsTotalDistance += (_a = legTrackSection.length) !== null && _a !== void 0 ? _a : 0;
            });
            legs.push(tripLeg);
        });
        if (legs.length === 0) {
            console.error('Trip.initFromTreeNode no legs found ?');
            console.log(treeNode);
            return null;
        }
        let distanceMeters = 0;
        let distanceSource = 'trip';
        const distanceS = treeNode.findTextFromChildNamed('Distance');
        if (distanceS === null) {
            distanceSource = 'legs-sum';
            distanceMeters = tripLegsTotalDistance;
        }
        else {
            distanceMeters = parseInt(distanceS);
        }
        const tripStats = {
            duration: duration,
            distanceMeters: distanceMeters,
            distanceSource: distanceSource,
            transferNo: parseInt(transfersNoS),
            startDatetime: tripStartTime,
            endDatetime: tripEndTime,
            isCancelled: null,
            isInfeasable: null,
            isUnplanned: null,
        };
        const cancelledNode = treeNode.findChildNamed('Cancelled');
        if (cancelledNode) {
            tripStats.isCancelled = cancelledNode.text === 'true';
        }
        const infeasableNode = treeNode.findChildNamed('Infeasible');
        if (infeasableNode) {
            tripStats.isInfeasable = infeasableNode.text === 'true';
        }
        const unplannedNode = treeNode.findChildNamed('Unplanned');
        if (unplannedNode) {
            tripStats.isUnplanned = unplannedNode.text === 'true';
        }
        const trip = new Trip(tripId, legs, tripStats);
        return trip;
    }
    computeDepartureTime() {
        var _a;
        const timedLegs = this.legs.filter(leg => {
            return leg instanceof TripTimedLeg;
        });
        if (timedLegs.length === 0) {
            console.log('No TimedLeg found for this trip');
            console.log(this);
            return null;
        }
        const firstTimedLeg = timedLegs[0];
        const timeData = firstTimedLeg.fromStopPoint.departureData;
        if (timeData === null) {
            return null;
        }
        const stopPointDate = (_a = timeData.estimatedTime) !== null && _a !== void 0 ? _a : timeData.timetableTime;
        return stopPointDate;
    }
    computeArrivalTime() {
        var _a;
        const timedLegs = this.legs.filter(leg => {
            return leg instanceof TripTimedLeg;
        });
        if (timedLegs.length === 0) {
            console.log('No TimedLeg found for this trip');
            console.log(this);
            return new Date();
        }
        const lastTimedLeg = timedLegs[timedLegs.length - 1];
        const timeData = lastTimedLeg.toStopPoint.arrivalData;
        if (timeData === null) {
            return null;
        }
        const stopPointDate = (_a = timeData.estimatedTime) !== null && _a !== void 0 ? _a : timeData.timetableTime;
        return stopPointDate;
    }
    addToXMLNode(parentNode) {
        const tripNode = parentNode.ele('ojp:Trip');
        tripNode.ele('ojp:TripId', this.id);
        tripNode.ele('ojp:Duration', this.stats.duration.asOJPFormattedText());
        tripNode.ele('ojp:StartTime', this.stats.startDatetime.toISOString());
        tripNode.ele('ojp:EndTime', this.stats.endDatetime.toISOString());
        tripNode.ele('ojp:Transfers', this.stats.transferNo);
        tripNode.ele('ojp:Distance', this.stats.distanceMeters);
        this.legs.forEach(leg => {
            leg.addToXMLNode(tripNode);
        });
    }
}
