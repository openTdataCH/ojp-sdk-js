import { TreeNode } from '../xml/tree-node';
import { StopPoint } from '../trip/leg/timed-leg/stop-point';
import { JourneyService } from '../journey/journey-service';
import { Location } from '../location/location';
import { PtSituationElement } from '../situation/situation-element';
export type StationBoardType = 'Departures' | 'Arrivals';
export declare class StopEvent {
    journeyService: JourneyService;
    stopPoint: StopPoint;
    prevStopPoints: StopPoint[];
    nextStopPoints: StopPoint[];
    constructor(stopPoint: StopPoint, journeyService: JourneyService);
    static initWithTreeNode(treeNode: TreeNode): StopEvent | null;
    patchStopEventLocations(mapContextLocations: Record<string, Location>): void;
    patchSituations(mapContextSituations: Record<string, PtSituationElement>): void;
}
