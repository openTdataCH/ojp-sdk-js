import { Location } from '../../location/location';
import { PathGuidance } from '../path-guidance';
import { TripLeg, LegType } from "./trip-leg";
import { Duration } from '../../shared/duration';
import { IndividualTransportMode, TransferMode } from '../../types/individual-mode.types';
import { ServiceBooking } from './continous-leg/service-booking';
import { TreeNode } from '../../xml/tree-node';
import { XMLElement } from 'xmlbuilder';
export declare class TripContinousLeg extends TripLeg {
    legTransportMode: IndividualTransportMode | null;
    legDistance: number;
    pathGuidance: PathGuidance | null;
    walkDuration: Duration | null;
    serviceBooking: ServiceBooking | null;
    transferMode: TransferMode | null;
    constructor(legType: LegType, legIDx: number, legDistance: number, fromLocation: Location, toLocation: Location);
    static initWithTreeNode(legIDx: number, treeNode: TreeNode, legType: LegType): TripContinousLeg | null;
    private computeLegTransportModeFromTreeNode;
    private computeLegTransferModeFromTreeNode;
    private computeLegTransportModeFromString;
    isDriveCarLeg(): boolean;
    isSharedMobility(): boolean;
    isWalking(): boolean;
    isTaxi(): boolean;
    formatDistance(): string;
    addToXMLNode(parentNode: XMLElement): void;
}
