import { TripStats } from '../types/trip-stats';
import { TripLeg } from './leg/trip-leg';
import { TreeNode } from '../xml/tree-node';
import { TripFareResult } from '../fare/fare';
import { XMLElement } from 'xmlbuilder';
export declare class Trip {
    id: string;
    legs: TripLeg[];
    stats: TripStats;
    tripFareResults: TripFareResult[];
    constructor(tripID: string, legs: TripLeg[], tripStats: TripStats);
    static initFromTreeNode(treeNode: TreeNode): Trip | null;
    computeDepartureTime(): Date | null;
    computeArrivalTime(): Date | null;
    addToXMLNode(parentNode: XMLElement): void;
}
