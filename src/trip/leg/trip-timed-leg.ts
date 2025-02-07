import { JourneyService } from '../../journey/journey-service'
import { StopPoint } from './timed-leg/stop-point'
import { LegTrack } from './leg-track'

import { TripLeg, LegType, LinePointData } from "./trip-leg"

import { StopPointTime } from './timed-leg/stop-point-time';

import { Location } from '../../location/location';
import { PtSituationElement } from '../../situation/situation-element'
import { TreeNode } from '../../xml/tree-node'
import { XMLElement } from 'xmlbuilder'
import { StopPointType } from '../../types/stop-point-type'
import { TripRequestBoardingType } from '../../request'

export class TripTimedLeg extends TripLeg {
  public service: JourneyService

  public fromStopPoint: StopPoint
  public toStopPoint: StopPoint
  public intermediateStopPoints: StopPoint[]

  constructor(
    legIDx: number,
    service: JourneyService,
    fromStopPoint: StopPoint,
    toStopPoint: StopPoint,
    intermediateStopPoints: StopPoint[] = []
  ) {
    const legType: LegType = 'TimedLeg'
    super(legType, legIDx, fromStopPoint.location, toStopPoint.location);
    this.service = service
    this.fromStopPoint = fromStopPoint
    this.toStopPoint = toStopPoint
    this.intermediateStopPoints = intermediateStopPoints
  }

  public static initWithTreeNode(legIDx: number, treeNode: TreeNode): TripTimedLeg | null {
    const service = JourneyService.initWithTreeNode(treeNode);
    if (service === null) {
      return null;
    }

    const fromStopTreeNode = treeNode.findChildNamed('LegBoard');
    const toStopTreeNode = treeNode.findChildNamed('LegAlight');
    if (fromStopTreeNode === null || toStopTreeNode === null) {
      return null;
    }

    const fromStopPoint = StopPoint.initWithTreeNode(fromStopTreeNode, 'From')
    const toStopPoint = StopPoint.initWithTreeNode(toStopTreeNode, 'To')
    if (fromStopPoint === null || toStopPoint === null) {
      return null;
    }

    const intermediateStopPoints: StopPoint[] = []
    const intermediaryStopTreeNodes: TreeNode[] = treeNode.findChildrenNamed('LegIntermediate');
    intermediaryStopTreeNodes.forEach(intermediaryStopTreeNode => {
      const stopPoint = StopPoint.initWithTreeNode(intermediaryStopTreeNode, 'Intermediate');
      if (stopPoint) {
        intermediateStopPoints.push(stopPoint)
      }
    });

    const timedLeg = new TripTimedLeg(legIDx, service, fromStopPoint, toStopPoint, intermediateStopPoints);

    timedLeg.legTrack = LegTrack.initWithLegTreeNode(treeNode);
    if (timedLeg.legTrack && timedLeg.legDuration === null) {
      timedLeg.legDuration = timedLeg.legTrack.duration;
    }
    
    return timedLeg;
  }

  public override patchLocations(mapContextLocations: Record<string, Location>) {
    super.patchLocations(mapContextLocations)

    this.intermediateStopPoints.forEach(stopPoint => {
      this.patchLocation(stopPoint.location, mapContextLocations);
    });
  }

  public computeDepartureTime(): Date | null {
    return this.computeStopPointTime(this.fromStopPoint.departureData)
  }

  public computeArrivalTime(): Date | null {
    return this.computeStopPointTime(this.toStopPoint.arrivalData)
  }

  private computeStopPointTime(timeData: StopPointTime | null): Date | null {
    if (timeData === null) {
      return null
    }

    const stopPointDate = timeData.estimatedTime ?? timeData.timetableTime;
    return stopPointDate
  }

  public patchSituations(mapContextSituations: Record<string, PtSituationElement>) {
    this.service.siriSituations = [];
    this.service.siriSituationIds.forEach(siriSituationId => {
      const siriSituation = mapContextSituations[siriSituationId] ?? null;
      if (siriSituation) {
        this.service.siriSituations.push(siriSituation)
      }
    })
  }

  public addToXMLNode(parentNode: XMLElement) {
    const tripLegNode = parentNode.ele('ojp:TripLeg');
    tripLegNode.ele('ojp:LegId', this.legID);
    
    const timedLeg = tripLegNode.ele('ojp:TimedLeg');
    
    const boardingTypes: TripRequestBoardingType[] = ['Arr', 'Dep'];

    const addStopPoint = (stopPoint: StopPoint, stopPointType: StopPointType) => {
      const legEndpointName: string = (() => {
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
        legEndpoint.ele('ojp:StopPointName').ele('ojp:Text', stopPlace.stopPlaceName ?? 'n/a');
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
