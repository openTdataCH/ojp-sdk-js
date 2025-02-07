import { DistanceSource, TripStats } from '../types/trip-stats'

import { TripLeg } from './leg/trip-leg'
import { TripLegFactory } from './leg/trip-leg-factory'
import { TripTimedLeg } from './leg/trip-timed-leg'
import { Duration } from '../shared/duration'
import { TreeNode } from '../xml/tree-node'
import { TripFareResult } from '../fare/fare'

import { XMLElement } from 'xmlbuilder'
import { DEBUG_LEVEL } from '../constants'

export class Trip {
  public id: string
  public legs: TripLeg[]
  public stats: TripStats
  public tripFareResults: TripFareResult[]

  constructor(tripID: string, legs: TripLeg[], tripStats: TripStats) {
    this.id = tripID;
    this.legs = legs;
    this.stats = tripStats
    this.tripFareResults = [];
  }

  public static initFromTreeNode(treeNode: TreeNode): Trip | null {
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

    const legs: TripLeg[] = [];
    let tripLegsTotalDistance = 0;

    const tripLegTreeNodes = treeNode.findChildrenNamed('Leg');
    tripLegTreeNodes.forEach(tripLegTreeNode => {
      const tripLeg = TripLegFactory.initWithTreeNode(tripLegTreeNode);
      if (tripLeg === null) {
        return;
      }

      const legTrackSections = tripLeg.legTrack?.trackSections ?? [];
      legTrackSections.forEach(legTrackSection => {
        tripLegsTotalDistance += legTrackSection.length ?? 0;
      });

      legs.push(tripLeg);
    });

    if (legs.length === 0) {
      console.error('Trip.initFromTreeNode no legs found ?');
      console.log(treeNode);
      return null;
    }

    let distanceMeters = 0;
    let distanceSource: DistanceSource = 'trip';
    const distanceS = treeNode.findTextFromChildNamed('Distance');
    if (distanceS === null) {
      distanceSource = 'legs-sum';
      distanceMeters = tripLegsTotalDistance;
    } else {
      distanceMeters = parseInt(distanceS);
    }

    const tripStats: TripStats = {
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

  public computeDepartureTime(): Date | null {
    const timedLegs = this.legs.filter(leg => {
      return leg instanceof TripTimedLeg;
    });

    if (timedLegs.length === 0) {
      console.log('No TimedLeg found for this trip');
      console.log(this);
      return null;
    }

    const firstTimedLeg = timedLegs[0] as TripTimedLeg;
    const timeData = firstTimedLeg.fromStopPoint.departureData;
    if (timeData === null) {
      return null
    }

    const stopPointDate = timeData.estimatedTime ?? timeData.timetableTime;

    return stopPointDate;
  }

  public computeArrivalTime(): Date | null {
    const timedLegs = this.legs.filter(leg => {
      return leg instanceof TripTimedLeg;
    });

    if (timedLegs.length === 0) {
      console.log('No TimedLeg found for this trip');
      console.log(this);
      return new Date();
    }

    const lastTimedLeg = timedLegs[timedLegs.length - 1] as TripTimedLeg;
    const timeData = lastTimedLeg.toStopPoint.arrivalData;
    if (timeData === null) {
      return null
    }

    const stopPointDate = timeData.estimatedTime ?? timeData.timetableTime;

    return stopPointDate;
  }

  public addToXMLNode(parentNode: XMLElement) {
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
