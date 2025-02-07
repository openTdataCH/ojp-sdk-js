import { TreeNode } from "../xml/tree-node";
export declare class TopographicPlace {
    code: string;
    name: string;
    constructor(code: string, name: string);
    static initWithLocationTreeNode(locationTreeNode: TreeNode): TopographicPlace | null;
}
