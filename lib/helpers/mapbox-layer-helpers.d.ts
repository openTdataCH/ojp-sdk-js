import * as mapboxgl from "mapbox-gl";
import { StopPointType } from "../types/stop-point-type";
export declare class MapboxLayerHelpers {
    static FilterBeelines(): mapboxgl.Expression;
    static FilterWalkingLegs(): mapboxgl.Expression;
    static FilterLegPoints(): mapboxgl.Expression;
    static ColorCaseByLegLineType(): mapboxgl.Expression;
    private static FilterByDrawType;
    static FilterByPointType(pointType: StopPointType): mapboxgl.Expression;
    private static FilterByLineType;
    static FilterTimedLegTracks(): mapboxgl.Expression;
    static ColorCaseByLegType(): mapboxgl.Expression;
}
