import { TreeNode } from "../xml/tree-node";
type TravelClass = "first" | "second";
declare class FareProduct {
    fareProductId: string;
    fareProductName: string;
    fareAuthorityRef: string;
    price: number;
    travelClass: TravelClass;
    constructor(fareProductId: string, fareProductName: string, fareAuthorityRef: string, price: number, travelClass: TravelClass);
    static initFromFareProductNode(fareProductNode: TreeNode): FareProduct | null;
}
export interface TripFareResult {
    fromTripLegIdRef: number;
    toTripLegIdRef: number;
    fareProduct: FareProduct;
}
export declare class FareResult {
    tripId: string;
    tripFareResults: TripFareResult[];
    constructor(tripId: string, tripFareResults: TripFareResult[]);
    static initWithFareResultTreeNode(fareResultTreeNode: TreeNode): FareResult | null;
}
export {};
