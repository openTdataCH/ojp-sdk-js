import * as GeoJSON from 'geojson';
import { GeoPosition } from "./geoposition";
export declare class GeoPositionBBOX {
    southWest: GeoPosition;
    northEast: GeoPosition;
    center: GeoPosition;
    minLongitude: number;
    minLatitude: number;
    maxLongitude: number;
    maxLatitude: number;
    constructor(geoPositions: GeoPosition | GeoPosition[]);
    static initFromGeoPosition(geoPosition: GeoPosition, width_x_meters: number, width_y_meters: number): GeoPositionBBOX;
    static initFromGeoJSONFeatures(features: GeoJSON.Feature[]): GeoPositionBBOX;
    extend(geoPositions: GeoPosition | GeoPosition[]): void;
    asFeatureBBOX(): [number, number, number, number];
    isValid(): boolean;
    containsGeoPosition(geoPosition: GeoPosition): boolean;
    computeWidth(): number;
    computeHeight(): number;
    asPolygon(): GeoJSON.Polygon;
}
