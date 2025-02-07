import { DataHelpers } from '../../helpers/data-helpers';
import { DEBUG_LEVEL } from '../../constants';
export class TripLeg {
    constructor(legType, legIDx, fromLocation, toLocation) {
        this.legType = legType;
        this.legID = legIDx;
        this.fromLocation = fromLocation;
        this.toLocation = toLocation;
        this.legTrack = null;
        this.legDuration = null;
    }
    patchLocations(mapContextLocations) {
        [this.fromLocation, this.toLocation].forEach(location => {
            var _a;
            this.patchLocation(location, mapContextLocations);
            if (location.geoPosition) {
                return;
            }
            if ((_a = this.legTrack) === null || _a === void 0 ? void 0 : _a.hasGeoData) {
                const isFrom = location === this.fromLocation;
                if (isFrom) {
                    this.fromLocation.geoPosition = this.legTrack.fromGeoPosition();
                }
                else {
                    this.toLocation.geoPosition = this.legTrack.toGeoPosition();
                }
            }
        });
    }
    patchSituations(mapContextSituations) {
        // override
    }
    patchLocation(location, mapContextLocations) {
        var _a, _b;
        if (location.geoPosition) {
            return;
        }
        let stopRef = (_b = (_a = location.stopPlace) === null || _a === void 0 ? void 0 : _a.stopPlaceRef) !== null && _b !== void 0 ? _b : null;
        if (stopRef === null) {
            if (DEBUG_LEVEL === 'DEBUG') {
                console.error('TripLeg.patchLocation - no stopPlaceRef found in location');
                console.log(location);
            }
            return;
        }
        if (!(stopRef in mapContextLocations)) {
            // For StopPoint try to get the StopPlace
            // see https://github.com/openTdataCH/ojp-sdk/issues/97
            stopRef = DataHelpers.convertStopPointToStopPlace(stopRef);
        }
        if (!(stopRef in mapContextLocations)) {
            if (DEBUG_LEVEL === 'DEBUG') {
                console.error('TripLeg.patchLocation - no stopPlaceRef found in mapContextLocations');
                console.log(location);
                console.log('location.stopPlace?.stopPlaceRef :' + stopRef);
                console.log(mapContextLocations);
            }
            return;
        }
        const contextLocation = mapContextLocations[stopRef];
        location.patchWithAnotherLocation(contextLocation);
    }
    addToXMLNode(parentNode) {
        // override
        debugger;
    }
}
