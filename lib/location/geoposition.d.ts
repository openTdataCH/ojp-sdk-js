import * as GeoJSON from 'geojson';
import { TreeNode } from "../xml/tree-node";
export declare class GeoPosition {
    longitude: number;
    latitude: number;
    properties: GeoJSON.GeoJsonProperties | null;
    constructor(longitude: number, latitude: number);
    static initWithStringCoords(longitudeS: string | null, latitudeS: string | null): GeoPosition | null;
    static initWithLocationTreeNode(locationTreeNode: TreeNode): GeoPosition | null;
    static initWithFeature(feature: GeoJSON.Feature): GeoPosition | null;
    asLngLat(): [number, number];
    asLatLngString(roundCoords?: boolean): string;
    asPosition(): GeoJSON.Position;
    distanceFrom(pointB: GeoPosition): number;
}
