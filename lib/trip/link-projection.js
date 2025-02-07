import { GeoPosition } from "../location/geoposition";
import { GeoPositionBBOX } from "../location/geoposition-bbox";
export class LinkProjection {
    // TODO - add length or computeLength()
    constructor(coordinates, bbox) {
        this.coordinates = coordinates;
        this.bbox = bbox;
    }
    static initWithTreeNode(treeNode) {
        const linkProjectionTreeNode = treeNode.findChildNamed('LinkProjection');
        if (linkProjectionTreeNode === null) {
            return null;
        }
        const coordinates = [];
        const positionTreeNodes = linkProjectionTreeNode.findChildrenNamed('Position');
        positionTreeNodes.forEach(positionTreeNode => {
            const longitudeS = positionTreeNode.findTextFromChildNamed('siri:Longitude');
            const latitudeS = positionTreeNode.findTextFromChildNamed('siri:Latitude');
            if (longitudeS && latitudeS) {
                const position = new GeoPosition(parseFloat(longitudeS), parseFloat(latitudeS));
                coordinates.push(position);
            }
        });
        if (coordinates.length < 2) {
            return null;
        }
        const bbox = new GeoPositionBBOX(coordinates);
        const linkProjection = new LinkProjection(coordinates, bbox);
        return linkProjection;
    }
    computeLength() {
        let distAB = 0;
        this.coordinates.forEach((geoPositionB, idx) => {
            if (idx === 0) {
                return;
            }
            const geoPositionA = this.coordinates[idx - 1];
            distAB += geoPositionB.distanceFrom(geoPositionA);
        });
        return distAB;
    }
    asGeoJSONFeature() {
        const feature = {
            type: 'Feature',
            bbox: this.bbox.asFeatureBBOX(),
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: []
            }
        };
        this.coordinates.forEach(geoPosition => {
            const pointCoords = [geoPosition.longitude, geoPosition.latitude];
            feature.geometry.coordinates.push(pointCoords);
        });
        return feature;
    }
}
