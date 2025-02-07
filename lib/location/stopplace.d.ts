import { TreeNode } from "../xml/tree-node";
type StopType = 'StopPlace' | 'StopPoint';
export declare class StopPlace {
    stopPlaceRef: string;
    stopPlaceName: string | null;
    topographicPlaceRef: string | null;
    stopType: StopType;
    constructor(stopPlaceRef: string, stopPlaceName: string | null, topographicPlaceRef: string | null, stopType?: StopType);
    static initWithLocationTreeNode(locationTreeNode: TreeNode): StopPlace | null;
    static initWithServiceTreeNode(treeNode: TreeNode, pointType: 'Origin' | 'Destination'): StopPlace | null;
}
export {};
