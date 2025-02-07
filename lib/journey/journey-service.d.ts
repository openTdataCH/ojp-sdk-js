import { XMLElement } from 'xmlbuilder';
import { PublicTransportMode } from './public-transport-mode';
import { StopPlace } from '../location/stopplace';
import { PtSituationElement } from '../situation/situation-element';
import { TreeNode } from '../xml/tree-node';
interface ServiceAttribute {
    code: string;
    text: string;
    extra: Record<string, string>;
}
export declare class JourneyService {
    journeyRef: string;
    lineRef: string | null;
    directionRef: string | null;
    operatingDayRef: string | null;
    ptMode: PublicTransportMode;
    agencyCode: string;
    originStopPlace: StopPlace | null;
    destinationStopPlace: StopPlace | null;
    serviceLineNumber: string | null;
    journeyNumber: string | null;
    siriSituationIds: string[];
    siriSituations: PtSituationElement[];
    serviceAttributes: Record<string, ServiceAttribute>;
    hasCancellation: boolean | null;
    hasDeviation: boolean | null;
    isUnplanned: boolean | null;
    constructor(journeyRef: string, ptMode: PublicTransportMode, agencyCode: string);
    static initWithTreeNode(treeNode: TreeNode): JourneyService | null;
    formatServiceName(): string;
    addToXMLNode(parentNode: XMLElement): void;
}
export {};
