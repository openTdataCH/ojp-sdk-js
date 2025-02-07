import { TreeNode } from "../xml/tree-node";
export declare class PtSituationSource {
    sourceType: string;
    countryRef: string | null;
    name: string | null;
    externalCode: string | null;
    constructor(sourceType: string);
    static initWithSituationTreeNode(treeNode: TreeNode): PtSituationSource | null;
}
