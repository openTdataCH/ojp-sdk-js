import { GeoPosition } from "./geoposition";
import { StopPlace } from "./stopplace";
import { Address } from "./address";
import { PointOfInterest } from "./poi";
import { TopographicPlace } from "./topographic-place";
const literalCoordsRegexp = /^([0-9\.]+?),([0-9\.]+?)$/;
export class Location {
    constructor() {
        this.address = null;
        this.locationName = null;
        this.stopPlace = null;
        this.geoPosition = null;
        this.poi = null;
        this.topographicPlace = null;
        this.attributes = {};
        this.probability = null;
        this.originSystem = null;
    }
    static initWithTreeNode(treeNode) {
        const location = new Location();
        location.address = Address.initWithLocationTreeNode(treeNode);
        location.geoPosition = GeoPosition.initWithLocationTreeNode(treeNode);
        location.locationName = treeNode.findTextFromChildNamed('Name/Text');
        location.poi = PointOfInterest.initWithLocationTreeNode(treeNode);
        location.stopPlace = StopPlace.initWithLocationTreeNode(treeNode);
        location.topographicPlace = TopographicPlace.initWithLocationTreeNode(treeNode);
        location.attributes = Location.computeAttributes(treeNode);
        return location;
    }
    static initWithLocationResultTreeNode(locationResultTreeNode) {
        const locationTreeNode = locationResultTreeNode.findChildNamed('Place');
        if (locationTreeNode === null) {
            return null;
        }
        const location = Location.initWithTreeNode(locationTreeNode);
        const probabilityS = locationResultTreeNode.findTextFromChildNamed('Probability');
        if (probabilityS) {
            location.probability = parseFloat(probabilityS);
        }
        location.originSystem = locationResultTreeNode.findTextFromChildNamed('OriginSystem');
        return location;
    }
    static initWithStopPlaceRef(stopPlaceRef, stopPlaceName = '') {
        const location = new Location();
        location.stopPlace = new StopPlace(stopPlaceRef, stopPlaceName, null);
        return location;
    }
    static initWithLngLat(longitude, latitude) {
        const location = new Location();
        location.geoPosition = new GeoPosition(longitude, latitude);
        return location;
    }
    static computeAttributes(treeNode) {
        const attributes = {};
        // <ojp:Attribute>
        //   <ojp:Text>
        //       <ojp:Text xml:lang="de">Berner Generationenhaus</ojp:Text>
        //   </ojp:Text>
        //   <ojp:Code>carvelo2go:1c741450-02ed-412e-ce4d-bfd470da7281</ojp:Code>
        //   <siri:HireFacility>cycleHire</siri:HireFacility>
        // </ojp:Attribute>
        const attributeTreeNode = treeNode.findChildNamed('Attribute');
        if (attributeTreeNode) {
            attributeTreeNode.children.forEach(attributeTreeNode => {
                const nodeNameParts = attributeTreeNode.name.split(':');
                const attrKey = nodeNameParts.length === 1 ? nodeNameParts[0] : nodeNameParts[1];
                const attrValue = attributeTreeNode.computeText();
                if (attrValue !== null) {
                    attributes[attrKey] = attrValue;
                }
            });
        }
        // <ojp:Extension>
        //     <ojp:LocationExtensionStructure>
        //         <ojp:num_vehicles_available>1</ojp:num_vehicles_available>
        //         <ojp:num_docks_available>0</ojp:num_docks_available>
        //     </ojp:LocationExtensionStructure>
        // </ojp:Extension>
        const extensionAttributesTreeNode = treeNode.findChildNamed('Extension/LocationExtensionStructure');
        if (extensionAttributesTreeNode) {
            extensionAttributesTreeNode.children.forEach(attributeTreeNode => {
                const attrKey = attributeTreeNode.name;
                attributes[attrKey] = attributeTreeNode.text;
            });
        }
        return attributes;
    }
    static initWithFeature(feature) {
        var _a, _b, _c, _d;
        const geoPosition = GeoPosition.initWithFeature(feature);
        if (geoPosition === null) {
            return null;
        }
        const attrs = feature.properties;
        if (attrs === null) {
            return null;
        }
        const location = new Location();
        location.geoPosition = geoPosition;
        location.locationName = (_a = attrs['locationName']) !== null && _a !== void 0 ? _a : null;
        const stopPlaceRef = attrs['stopPlace.stopPlaceRef'];
        if (stopPlaceRef) {
            const stopPlaceName = (_b = attrs['stopPlace.stopPlaceName']) !== null && _b !== void 0 ? _b : null;
            location.stopPlace = new StopPlace(stopPlaceRef, stopPlaceName, null);
        }
        const addressCode = attrs['addressCode'];
        if (addressCode) {
            const address = new Address(addressCode);
            address.addressName = (_c = attrs['addressName']) !== null && _c !== void 0 ? _c : null;
            address.topographicPlaceRef = (_d = attrs['topographicPlaceRef']) !== null && _d !== void 0 ? _d : null;
        }
        return location;
    }
    static initFromLiteralCoords(inputS) {
        let inputLiteralCoords = inputS.trim();
        // strip: parantheses (groups)
        inputLiteralCoords = inputLiteralCoords.replace(/\(.+?\)/g, '');
        // strip: characters NOT IN [0..9 , .]
        inputLiteralCoords = inputLiteralCoords.replace(/[^0-9\.,]/g, '');
        const inputMatches = inputLiteralCoords.match(literalCoordsRegexp);
        if (inputMatches === null) {
            return null;
        }
        let longitude = parseFloat(inputMatches[1]);
        let latitude = parseFloat(inputMatches[2]);
        // In CH always long < lat
        if (longitude > latitude) {
            longitude = parseFloat(inputMatches[2]);
            latitude = parseFloat(inputMatches[1]);
        }
        const location = Location.initWithLngLat(longitude, latitude);
        // Match the content inside the ()
        const locationNameMatches = inputS.trim().match(/\(([^\)]*)\)?/);
        if (locationNameMatches !== null) {
            const locationName = locationNameMatches[1];
            location.locationName = locationName;
        }
        return location;
    }
    asGeoJSONFeature() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        if (this.geoPosition === null) {
            return null;
        }
        const featureProperties = {};
        const stopPlaceRef = (_b = (_a = this.stopPlace) === null || _a === void 0 ? void 0 : _a.stopPlaceRef) !== null && _b !== void 0 ? _b : null;
        if (stopPlaceRef) {
            featureProperties['stopPlace.stopPlaceRef'] = (_d = (_c = this.stopPlace) === null || _c === void 0 ? void 0 : _c.stopPlaceRef) !== null && _d !== void 0 ? _d : '';
            featureProperties['stopPlace.stopPlaceName'] = (_f = (_e = this.stopPlace) === null || _e === void 0 ? void 0 : _e.stopPlaceName) !== null && _f !== void 0 ? _f : '';
            featureProperties['stopPlace.topographicPlaceRef'] = (_h = (_g = this.stopPlace) === null || _g === void 0 ? void 0 : _g.topographicPlaceRef) !== null && _h !== void 0 ? _h : '';
        }
        if (this.address) {
            featureProperties['addressCode'] = (_k = (_j = this.address) === null || _j === void 0 ? void 0 : _j.addressCode) !== null && _k !== void 0 ? _k : '';
            featureProperties['addressName'] = (_m = (_l = this.address) === null || _l === void 0 ? void 0 : _l.addressName) !== null && _m !== void 0 ? _m : '';
            featureProperties['topographicPlaceRef'] = (_p = (_o = this.address) === null || _o === void 0 ? void 0 : _o.topographicPlaceRef) !== null && _p !== void 0 ? _p : '';
        }
        if (this.poi) {
            featureProperties['poi.name'] = this.poi.name;
            featureProperties['poi.code'] = this.poi.code;
            featureProperties['poi.category'] = this.poi.category;
            featureProperties['poi.subcategory'] = this.poi.subCategory;
            featureProperties['poi.osm.tags'] = this.poi.categoryTags.join(',');
        }
        featureProperties['locationName'] = (_q = this.locationName) !== null && _q !== void 0 ? _q : '';
        for (let attrKey in this.attributes) {
            featureProperties['OJP.Attr.' + attrKey] = this.attributes[attrKey];
        }
        const feature = {
            type: 'Feature',
            properties: featureProperties,
            geometry: {
                type: 'Point',
                coordinates: [
                    this.geoPosition.longitude,
                    this.geoPosition.latitude
                ]
            }
        };
        return feature;
    }
    computeLocationName(includeLiteralCoords = true) {
        var _a, _b;
        if ((_a = this.stopPlace) === null || _a === void 0 ? void 0 : _a.stopPlaceName) {
            return this.stopPlace.stopPlaceName;
        }
        if ((_b = this.topographicPlace) === null || _b === void 0 ? void 0 : _b.name) {
            return this.topographicPlace.name;
        }
        if (this.poi && this.poi.name) {
            return this.poi.name;
        }
        if (this.locationName) {
            return this.locationName;
        }
        if (includeLiteralCoords && this.geoPosition) {
            return this.geoPosition.asLatLngString();
        }
        return null;
    }
    findClosestLocation(otherLocations) {
        const geoPositionA = this.geoPosition;
        if (geoPositionA === null) {
            return null;
        }
        let closestLocation = null;
        otherLocations.forEach(locationB => {
            const geoPositionB = locationB.geoPosition;
            if (geoPositionB === null) {
                return;
            }
            const dAB = geoPositionA.distanceFrom(geoPositionB);
            if ((closestLocation === null) || (dAB < closestLocation.distance)) {
                closestLocation = {
                    location: locationB,
                    distance: dAB
                };
            }
        });
        return closestLocation;
    }
    getLocationType() {
        if (this.stopPlace) {
            return 'stop';
        }
        if (this.poi) {
            return 'poi';
        }
        if (this.address) {
            return 'address';
        }
        if (this.topographicPlace) {
            return 'topographicPlace';
        }
        return null;
    }
    patchWithAnotherLocation(anotherLocation) {
        this.locationName = anotherLocation.locationName;
        this.stopPlace = anotherLocation.stopPlace;
        this.geoPosition = anotherLocation.geoPosition;
    }
}
