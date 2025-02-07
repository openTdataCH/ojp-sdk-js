import { LinkProjection } from "./link-projection";
export class PathGuidance {
    constructor(sections) {
        this.sections = sections;
    }
    static initWithTreeNode(treeNode) {
        const pathGuidanceTreeNode = treeNode.findChildNamed('PathGuidance');
        if (pathGuidanceTreeNode === null) {
            return null;
        }
        let sections = [];
        const sectionTreeNodes = pathGuidanceTreeNode.findChildrenNamed('PathGuidanceSection');
        sectionTreeNodes.forEach(sectionTreeNode => {
            const pathGuidanceSection = PathGuidanceSection.initWithSectionTreeNode(sectionTreeNode);
            if (pathGuidanceSection) {
                sections.push(pathGuidanceSection);
            }
        });
        const pathGuidance = new PathGuidance(sections);
        return pathGuidance;
    }
}
class PathGuidanceSection {
    constructor() {
        this.trackSection = null;
        this.guidanceAdvice = null;
        this.turnAction = null;
    }
    static initWithSectionTreeNode(sectionTreeNode) {
        const pathGuidanceSection = new PathGuidanceSection();
        const trackSectionTreeNode = sectionTreeNode.findChildNamed('TrackSection');
        if (trackSectionTreeNode) {
            pathGuidanceSection.trackSection = TrackSection.initWithTrackSectionTreeNode(trackSectionTreeNode);
        }
        pathGuidanceSection.guidanceAdvice = sectionTreeNode.findTextFromChildNamed('GuidanceAdvice');
        pathGuidanceSection.turnAction = sectionTreeNode.findTextFromChildNamed('TurnAction');
        return pathGuidanceSection;
    }
}
class TrackSection {
    constructor() {
        this.linkProjection = null;
        this.roadName = null;
        this.duration = null;
        this.length = null;
    }
    static initWithTrackSectionTreeNode(trackSectionTreeNode) {
        const trackSection = new TrackSection();
        trackSection.linkProjection = LinkProjection.initWithTreeNode(trackSectionTreeNode);
        trackSection.roadName = trackSectionTreeNode.findTextFromChildNamed('RoadName');
        trackSection.duration = trackSectionTreeNode.findTextFromChildNamed('Duration');
        const lengthS = trackSectionTreeNode.findTextFromChildNamed('Length');
        if (lengthS !== null) {
            trackSection.length = parseInt(lengthS, 10);
        }
        return trackSection;
    }
}
