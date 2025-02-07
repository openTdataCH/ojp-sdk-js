import { TreeNode } from "../xml/tree-node";
import { PtSituationSource } from './situation-source';
interface TimeInterval {
    startDate: Date;
    endDate: Date;
}
type ScopeType = 'line' | 'stopPlace' | 'vehicleJourney' | 'unknown';
interface PassengerInformationAction {
    actionRef: string | null;
    ownerRef: string | null;
    perspectives: string[];
    mapTextualContent: Record<string, string[]>;
}
interface StopPlace {
    stopPlaceRef: string;
    placeName: string;
}
interface NetworkOperator {
    operatorRef: string;
}
interface LineNetwork {
    operator: NetworkOperator;
    lineRef: string;
    publishedLineName: string;
    stopPlaces: StopPlace[];
}
interface AffectedLineNetworkWithStops {
    lineNetwork: LineNetwork;
    directionRef: string;
    stopPlaces: StopPlace[];
}
interface FramedVehicleJourneyRef {
    dataFrameRef: string;
    datedVehicleJourneyRef: string;
}
interface AffectedStopPlace {
    stopPlaceRef: string;
    placeName: string | null;
}
interface AffectedVehicleJourney {
    framedVehicleJourneyRef: FramedVehicleJourneyRef;
    operator: NetworkOperator;
    origin: AffectedStopPlace | null;
    destination: AffectedStopPlace | null;
    callStopsRef: string[];
    lineRef: string | null;
    publishedLineName: string | null;
}
interface PublishingActionAffect {
    type: 'stop' | 'entire-line' | 'partial-line' | 'vehicle-journey';
    affect: StopPlace | LineNetwork | AffectedLineNetworkWithStops | AffectedVehicleJourney;
}
interface PublishingAction {
    passengerInformation: PassengerInformationAction;
    affects: PublishingActionAffect[];
}
export interface SituationContent {
    summary: string;
    descriptions: string[];
    details: string[];
}
export declare class PtSituationElement {
    situationNumber: string;
    creationTime: Date;
    countryRef: string;
    participantRef: string;
    version: number;
    source: PtSituationSource;
    progress: string;
    validityPeriods: TimeInterval[];
    alertCause: string;
    priority: number;
    scopeType: ScopeType;
    publishingActions: PublishingAction[];
    isPlanned: boolean;
    situationContent: SituationContent | null;
    treeNode: TreeNode | null;
    constructor(situationNumber: string, creationTime: Date, countryRef: string, participantRef: string, version: number, source: PtSituationSource, progress: string, validityPeriods: TimeInterval[], alertCause: string, priority: number, scopeType: ScopeType, publishingActions: PublishingAction[], isPlanned: boolean);
    static initWithSituationTreeNode(treeNode: TreeNode): PtSituationElement | null;
    private static computePublishingActionsFromSituationNode;
    private static computePublishingAction;
    private static computeAffects;
    private static computeLineNetwork;
    private static computeAffectedStopPlaces;
    private static computeAffectedJourneys;
    isActive(date?: Date): boolean;
    static computeSituationContent(treeNode: TreeNode): SituationContent | null;
}
export {};
