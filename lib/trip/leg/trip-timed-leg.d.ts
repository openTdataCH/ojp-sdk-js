import { JourneyService } from '../../journey/journey-service';
import { StopPoint } from './timed-leg/stop-point';
import { TripLeg } from "./trip-leg";
import { Location } from '../../location/location';
import { PtSituationElement } from '../../situation/situation-element';
import { TreeNode } from '../../xml/tree-node';
import { XMLElement } from 'xmlbuilder';
export declare class TripTimedLeg extends TripLeg {
    service: JourneyService;
    fromStopPoint: StopPoint;
    toStopPoint: StopPoint;
    intermediateStopPoints: StopPoint[];
    constructor(legIDx: number, service: JourneyService, fromStopPoint: StopPoint, toStopPoint: StopPoint, intermediateStopPoints?: StopPoint[]);
    static initWithTreeNode(legIDx: number, treeNode: TreeNode): TripTimedLeg | null;
    patchLocations(mapContextLocations: Record<string, Location>): void;
    computeDepartureTime(): Date | null;
    computeArrivalTime(): Date | null;
    private computeStopPointTime;
    patchSituations(mapContextSituations: Record<string, PtSituationElement>): void;
    addToXMLNode(parentNode: XMLElement): void;
}
