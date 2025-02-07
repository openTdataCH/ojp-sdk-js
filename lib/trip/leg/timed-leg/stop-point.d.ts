import { Location } from "../../../location/location";
import { StopPointTime } from "./stop-point-time";
import { StopPointType } from "../../../types/stop-point-type";
import { PtSituationElement } from "../../../situation/situation-element";
import { TreeNode } from "../../../xml/tree-node";
type VehicleAccessType = 'PLATFORM_ACCESS_WITHOUT_ASSISTANCE' | 'PLATFORM_ACCESS_WITH_ASSISTANCE' | 'PLATFORM_ACCESS_WITH_ASSISTANCE_WHEN_NOTIFIED' | 'PLATFORM_NOT_WHEELCHAIR_ACCESSIBLE' | 'ALTERNATIVE_TRANSPORT' | 'NO_DATA';
export declare class StopPoint {
    stopPointType: StopPointType;
    location: Location;
    arrivalData: StopPointTime | null;
    departureData: StopPointTime | null;
    plannedPlatform: string | null;
    actualPlatform: string | null;
    sequenceOrder: number | null;
    isNotServicedStop: boolean | null;
    siriSituationIds: string[];
    siriSituations: PtSituationElement[];
    vehicleAccessType: VehicleAccessType | null;
    constructor(stopPointType: StopPointType, location: Location, arrivalData: StopPointTime | null, departureData: StopPointTime | null, plannedPlatform: string | null, sequenceOrder: number | null);
    static initWithTreeNode(treeNode: TreeNode, stopPointType: StopPointType): StopPoint | null;
    private static computePlatformAssistance;
}
export {};
