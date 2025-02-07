import { RestrictionPoiOSMTag } from "../types/lir-restrictions.type";
import { TreeNode } from "../xml/tree-node";
export declare class PointOfInterest {
    code: string;
    name: string;
    category: RestrictionPoiOSMTag;
    subCategory: string | null;
    categoryTags: string[];
    constructor(code: string, name: string, category: RestrictionPoiOSMTag, subCategory: string | null, categoryTags: string[]);
    static initWithLocationTreeNode(locationTreeNode: TreeNode): PointOfInterest | null;
    computePoiMapIcon(): string;
}
