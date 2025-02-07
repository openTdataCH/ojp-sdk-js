import { Location } from "../location/location";
import { IndividualTransportMode } from "../types/individual-mode.types";
export declare class TripLocationPoint {
    location: Location;
    minDuration: number | null;
    maxDuration: number | null;
    minDistance: number | null;
    maxDistance: number | null;
    customTransportMode?: IndividualTransportMode | null;
    dwellTimeMinutes: number | null;
    constructor(location: Location);
    static Empty(): TripLocationPoint;
}
