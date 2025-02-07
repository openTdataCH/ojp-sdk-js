import { GeoPosition } from "./geoposition";
export class GeoPositionBBOX {
    constructor(geoPositions) {
        if (!Array.isArray(geoPositions)) {
            geoPositions = [geoPositions];
        }
        this.minLongitude = Math.min.apply(null, geoPositions.map(gp => gp.longitude));
        this.minLatitude = Math.min.apply(null, geoPositions.map(gp => gp.latitude));
        this.maxLongitude = Math.max.apply(null, geoPositions.map(gp => gp.longitude));
        this.maxLatitude = Math.max.apply(null, geoPositions.map(gp => gp.latitude));
        this.southWest = new GeoPosition(this.minLongitude, this.minLatitude);
        this.northEast = new GeoPosition(this.maxLongitude, this.maxLatitude);
        const centerX = (this.southWest.longitude + this.northEast.longitude) / 2;
        const centerY = (this.southWest.latitude + this.northEast.latitude) / 2;
        this.center = new GeoPosition(centerX, centerY);
    }
    static initFromGeoPosition(geoPosition, width_x_meters, width_y_meters) {
        // 7612m for 0.1deg long - for Switzerland, latitude 46.8
        // 11119m for 0.1deg lat
        const spanLongitude = width_x_meters * 0.1 / 7612;
        const spanLatitude = width_y_meters * 0.1 / 11119;
        const southWest = new GeoPosition(geoPosition.longitude - spanLongitude / 2, geoPosition.latitude - spanLatitude / 2);
        const northEast = new GeoPosition(geoPosition.longitude + spanLongitude / 2, geoPosition.latitude + spanLatitude / 2);
        const bbox = new GeoPositionBBOX([southWest, northEast]);
        return bbox;
    }
    static initFromGeoJSONFeatures(features) {
        const bbox = new GeoPositionBBOX([]);
        features.forEach(feature => {
            var _a;
            const featureBBOX = (_a = feature.bbox) !== null && _a !== void 0 ? _a : null;
            if (featureBBOX) {
                const bboxSW = new GeoPosition(featureBBOX[0], featureBBOX[1]);
                bbox.extend(bboxSW);
                const bboxNE = new GeoPosition(featureBBOX[2], featureBBOX[3]);
                bbox.extend(bboxNE);
            }
            else {
                if (feature.geometry.type === 'LineString') {
                    const points = feature.geometry;
                    points.coordinates.forEach(pointCoords => {
                        const geoPosition = new GeoPosition(pointCoords[0], pointCoords[1]);
                        bbox.extend(geoPosition);
                    });
                }
            }
        });
        return bbox;
    }
    extend(geoPositions) {
        if (!Array.isArray(geoPositions)) {
            geoPositions = [geoPositions];
        }
        geoPositions.forEach(geoPosition => {
            const southWestLongitude = Math.min(this.southWest.longitude, geoPosition.longitude);
            const southWestLatitude = Math.min(this.southWest.latitude, geoPosition.latitude);
            const northEastLongitude = Math.max(this.northEast.longitude, geoPosition.longitude);
            const northEastLatitude = Math.max(this.northEast.latitude, geoPosition.latitude);
            this.southWest = new GeoPosition(southWestLongitude, southWestLatitude);
            this.northEast = new GeoPosition(northEastLongitude, northEastLatitude);
        });
        const centerX = (this.southWest.longitude + this.northEast.longitude) / 2;
        const centerY = (this.southWest.latitude + this.northEast.latitude) / 2;
        this.center = new GeoPosition(centerX, centerY);
        this.minLongitude = this.southWest.longitude;
        this.minLatitude = this.southWest.latitude;
        this.maxLongitude = this.northEast.longitude;
        this.maxLatitude = this.northEast.latitude;
    }
    asFeatureBBOX() {
        const bbox = [
            this.southWest.longitude,
            this.southWest.latitude,
            this.northEast.longitude,
            this.northEast.latitude,
        ];
        return bbox;
    }
    isValid() {
        if (this.southWest.longitude === Infinity) {
            return false;
        }
        return true;
    }
    containsGeoPosition(geoPosition) {
        if (geoPosition.longitude < this.southWest.longitude) {
            return false;
        }
        if (geoPosition.latitude < this.southWest.latitude) {
            return false;
        }
        if (geoPosition.longitude > this.northEast.longitude) {
            return false;
        }
        if (geoPosition.latitude > this.northEast.latitude) {
            return false;
        }
        return true;
    }
    computeWidth() {
        const northWest = new GeoPosition(this.southWest.longitude, this.northEast.latitude);
        const southEast = new GeoPosition(this.northEast.longitude, this.southWest.latitude);
        const distLongitude1 = southEast.distanceFrom(this.southWest);
        const distLongitude2 = this.northEast.distanceFrom(northWest);
        const distance = (distLongitude1 + distLongitude2) / 2;
        return distance;
    }
    computeHeight() {
        const northWest = new GeoPosition(this.southWest.longitude, this.northEast.latitude);
        const southEast = new GeoPosition(this.northEast.longitude, this.southWest.latitude);
        const distLatitude1 = southEast.distanceFrom(this.northEast);
        const distLatitude2 = this.southWest.distanceFrom(northWest);
        const distance = (distLatitude1 + distLatitude2) / 2;
        return distance;
    }
    asPolygon() {
        const bboxSW = this.southWest;
        const bboxNW = new GeoPosition(this.southWest.longitude, this.northEast.latitude);
        const bboxNE = this.northEast;
        const bboxSE = new GeoPosition(this.northEast.longitude, this.southWest.latitude);
        const coords = [
            bboxSW.asPosition(),
            bboxNW.asPosition(),
            bboxNE.asPosition(),
            bboxSE.asPosition(),
            bboxSW.asPosition(),
        ];
        const polygon = {
            type: "Polygon",
            coordinates: [
                coords
            ]
        };
        return polygon;
    }
}
