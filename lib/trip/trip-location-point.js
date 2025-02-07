import { Location } from "../location/location";
export class TripLocationPoint {
    constructor(location) {
        this.location = location;
        this.minDuration = null;
        this.maxDuration = null;
        this.minDistance = null;
        this.maxDistance = null;
        this.customTransportMode = null;
        this.dwellTimeMinutes = null;
    }
    static Empty() {
        const location = new Location();
        const locationPoint = new TripLocationPoint(location);
        return locationPoint;
    }
}
