import { TreeNode } from "../xml/tree-node";
import { LinkProjection } from "./link-projection";
export declare class PathGuidance {
    sections: PathGuidanceSection[];
    constructor(sections: PathGuidanceSection[]);
    static initWithTreeNode(treeNode: TreeNode): PathGuidance | null;
}
declare class PathGuidanceSection {
    trackSection: TrackSection | null;
    guidanceAdvice: string | null;
    turnAction: string | null;
    constructor();
    static initWithSectionTreeNode(sectionTreeNode: TreeNode): PathGuidanceSection;
}
declare class TrackSection {
    linkProjection: LinkProjection | null;
    roadName: string | null;
    duration: string | null;
    length: number | null;
    constructor();
    static initWithTrackSectionTreeNode(trackSectionTreeNode: TreeNode): TrackSection;
}
export {};
