import { TreeNode } from "../xml/tree-node";
export declare class Duration {
    hours: number;
    minutes: number;
    totalMinutes: number;
    constructor(hours: number, minutes: number);
    static initWithTreeNode(parentTreeNode: TreeNode, nodeName?: string): Duration | null;
    static initFromDurationText(durationS: string | null): Duration | null;
    static initFromTotalMinutes(totalMinutes: number): Duration;
    formatDuration(): string;
    plus(otherDuration: Duration): Duration;
    asOJPFormattedText(): string;
}
