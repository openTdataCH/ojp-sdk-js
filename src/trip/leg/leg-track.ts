import { GeoPosition } from "../../location/geoposition";
import { Location } from "../../location/location"
import { Duration } from "../../shared/duration";
import { TreeNode } from "../../xml/tree-node";
import { LinkProjection } from "../link-projection";

export class LegTrack {
  public trackSections: TrackSection[]
  public hasGeoData: boolean
  public duration: Duration | null

  constructor(trackSections: TrackSection[]) {
    this.trackSections = trackSections;
    let durationMinutes = 0

    this.hasGeoData = false
    trackSections.forEach(trackSection => {
      if (trackSection.linkProjection) {
        this.hasGeoData = true
      }

      if (trackSection.duration) {
        durationMinutes += trackSection.duration.totalMinutes
      }
    })

    this.duration = null
    if (durationMinutes > 0) {
      this.duration = Duration.initFromTotalMinutes(durationMinutes)
    }
  }

  public plus(otherLegTrack: LegTrack): LegTrack {
    if (this.duration !== null && otherLegTrack.duration !== null) {
      this.duration = this.duration.plus(otherLegTrack.duration);
    }

    this.trackSections = this.trackSections.concat(otherLegTrack.trackSections);

    return this;
  }

  public static initWithLegTreeNode(treeNode: TreeNode): LegTrack | null {
    const legTrackTreeNode = treeNode.findChildNamed('LegTrack');
    if (legTrackTreeNode === null) {
      return null;
    }

    const trackSections: TrackSection[] = [];
    
    const trackSectionTreeNodes = legTrackTreeNode.findChildrenNamed('TrackSection');
    trackSectionTreeNodes.forEach(trackSectionTreeNode => {
      const trackSection = TrackSection.initWithTreeNode(trackSectionTreeNode);
      if (trackSection) {
        trackSections.push(trackSection);
      }
    });

    const legTrack = new LegTrack(trackSections);

    return legTrack;
  }

  public fromGeoPosition(): GeoPosition | null {
    const hasSections = this.trackSections.length === 0
    if (hasSections) {
      return null
    }

    const firstLinkProjection = this.trackSections[0].linkProjection
    if (firstLinkProjection === null) {
      return null
    }

    return firstLinkProjection.coordinates[0]
  }

  public toGeoPosition(): GeoPosition | null {
    const hasSections = this.trackSections.length === 0
    if (hasSections) {
      return null
    }

    const lastLinkProjection = this.trackSections[this.trackSections.length - 1].linkProjection
    if (lastLinkProjection === null) {
      return null
    }

    return lastLinkProjection.coordinates[lastLinkProjection.coordinates.length - 1]
  }
}

class TrackSection {
  public fromLocation: Location
  public toLocation: Location
  public duration: Duration | null
  public length: number | null
  public linkProjection: LinkProjection | null;

  constructor(fromLocation: Location, toLocation: Location) {
    this.fromLocation = fromLocation
    this.toLocation = toLocation
    this.duration = null
    this.length = null
    this.linkProjection = null
  }

  public static initWithTreeNode(treeNode: TreeNode): TrackSection | null {
    const trackStartTreeNode = treeNode.findChildNamed('TrackSectionStart');
    const trackEndTreeNode = treeNode.findChildNamed('TrackSectionEnd');

    if (!(trackStartTreeNode && trackEndTreeNode)) {
      return null;
    }

    const fromLocation = Location.initWithTreeNode(trackStartTreeNode);
    const toLocation = Location.initWithTreeNode(trackEndTreeNode);

    if (!(fromLocation && toLocation)) {
      console.error('CANT instantiate TrackSection.initWithTreeNode');
      console.log(treeNode);
      return null;
    }

    const trackSection = new TrackSection(fromLocation, toLocation);
    trackSection.duration = Duration.initWithTreeNode(treeNode);

    const linkProjection = LinkProjection.initWithTreeNode(treeNode);
    trackSection.linkProjection = linkProjection;
    
    const lengthS = treeNode.findTextFromChildNamed('Length');
    if (lengthS === null) {
      if (linkProjection) {
        trackSection.length = linkProjection.computeLength();
      }
    } else {
      trackSection.length = parseInt(lengthS, 10);
    }

    return trackSection;
  }
}
