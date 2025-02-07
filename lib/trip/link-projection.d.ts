import * as GeoJSON from 'geojson';
import { GeoPosition } from "../location/geoposition";
import { GeoPositionBBOX } from "../location/geoposition-bbox";
import { TreeNode } from '../xml/tree-node';
export declare class LinkProjection {
    coordinates: GeoPosition[];
    bbox: GeoPositionBBOX;
    constructor(coordinates: GeoPosition[], bbox: GeoPositionBBOX);
    static initWithTreeNode(treeNode: TreeNode): LinkProjection | null;
    computeLength(): number;
    asGeoJSONFeature(): GeoJSON.Feature<GeoJSON.LineString>;
}
