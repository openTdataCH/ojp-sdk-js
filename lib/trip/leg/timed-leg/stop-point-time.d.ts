import { TreeNode } from "../../../xml/tree-node";
export declare class StopPointTime {
    timetableTime: Date;
    estimatedTime: Date | null;
    delayMinutes: number | null;
    constructor(timetableTime: Date, estimatedTime: Date | null);
    static initWithParentTreeNode(parentTreeNode: TreeNode, stopTimeType: string): StopPointTime | null;
    private static initWithContextTreeNode;
}
