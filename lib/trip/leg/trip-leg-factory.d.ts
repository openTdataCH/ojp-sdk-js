import { TreeNode } from "../../xml/tree-node";
import { TripContinousLeg } from "./trip-continous-leg";
import { TripTimedLeg } from "./trip-timed-leg";
export declare class TripLegFactory {
    static initWithTreeNode(treeNode: TreeNode): TripContinousLeg | TripTimedLeg | null;
}
