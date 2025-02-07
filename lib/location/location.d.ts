import * as GeoJSON from 'geojson';
import { GeoPosition } from "./geoposition";
import { StopPlace } from "./stopplace";
import { Address } from "./address";
import { PointOfInterest } from "./poi";
import { TopographicPlace } from "./topographic-place";
import { TreeNode } from '../xml/tree-node';
interface NearbyLocation {
    distance: number;
    location: Location;
}
export type LocationType = 'stop' | 'address' | 'poi' | 'topographicPlace';
export declare class Location {
    address: Address | null;
    locationName: string | null;
    stopPlace: StopPlace | null;
    geoPosition: GeoPosition | null;
    poi: PointOfInterest | null;
    topographicPlace: TopographicPlace | null;
    attributes: Record<string, any>;
    probability: number | null;
    originSystem: string | null;
    constructor();
    static initWithTreeNode(treeNode: TreeNode): Location;
    static initWithLocationResultTreeNode(locationResultTreeNode: TreeNode): Location | null;
    static initWithStopPlaceRef(stopPlaceRef: string, stopPlaceName?: string): Location;
    static initWithLngLat(longitude: number, latitude: number): Location;
    private static computeAttributes;
    static initWithFeature(feature: GeoJSON.Feature): Location | null;
    static initFromLiteralCoords(inputS: string): Location | null;
    asGeoJSONFeature(): GeoJSON.Feature<GeoJSON.Point> | null;
    computeLocationName(includeLiteralCoords?: boolean): string | null;
    findClosestLocation(otherLocations: Location[]): NearbyLocation | null;
    getLocationType(): LocationType | null;
    patchWithAnotherLocation(anotherLocation: Location): void;
}
export {};
