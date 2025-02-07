import { JourneyService } from "../../journey/journey-service";
import { Location } from "../../location/location";
import { TreeNode } from "../../xml/tree-node";
import { StopPoint } from "../leg/timed-leg/stop-point";
interface TripInfoResultMetadata {
    transportTypeName: string;
    publishedJourneyNumber: string;
    operatorName: string;
}
export declare class TripInfoResult {
    stopPoints: StopPoint[];
    service: JourneyService;
    metadata: TripInfoResultMetadata;
    constructor(stopPoints: StopPoint[], service: JourneyService, metadata: TripInfoResultMetadata);
    static initFromTreeNode(treeNode: TreeNode): TripInfoResult | null;
    patchLocations(mapContextLocations: Record<string, Location>): void;
}
export {};
