import * as GeoJSON from 'geojson'

import { GeoPosition } from "./geoposition";
import { StopPlace } from "./stopplace";
import { Address } from "./address";
import { PointOfInterest } from "./poi";
import { TopographicPlace } from "./topographic-place";
import { TreeNode } from '../xml/tree-node';

interface NearbyLocation {
  distance: number
  location: Location
}

// TODO - long term: subclass from Location?
export type LocationType = 'stop' | 'address' | 'poi' | 'topographicPlace'

const literalCoordsRegexp = /^([0-9\.]+?),([0-9\.]+?)$/;

export class Location {
  public address: Address | null
  public locationName: string | null
  public stopPlace: StopPlace | null
  public geoPosition: GeoPosition | null
  public poi: PointOfInterest | null
  public topographicPlace: TopographicPlace | null
  public attributes: Record<string, any>
  public probability: number | null
  public originSystem: string | null

  constructor() {
    this.address = null
    this.locationName = null;
    this.stopPlace = null;
    this.geoPosition = null;
    this.poi = null;
    this.topographicPlace = null;
    this.attributes = {};
    this.probability = null;
    this.originSystem = null;
  }

  public static initWithTreeNode(treeNode: TreeNode): Location {
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

  public static initWithLocationResultTreeNode(locationResultTreeNode: TreeNode): Location | null {
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

  public static initWithStopPlaceRef(stopPlaceRef: string, stopPlaceName: string = ''): Location {
    const location = new Location()
    location.stopPlace = new StopPlace(stopPlaceRef, stopPlaceName, null)

    return location
  }

  public static initWithLngLat(longitude: number, latitude: number): Location {
    const location = new Location()
    location.geoPosition = new GeoPosition(longitude, latitude);

    return location
  }

  private static computeAttributes(treeNode: TreeNode): Record<string, any> {
    const attributes: Record<string, any> = {};

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

  public static initWithFeature(feature: GeoJSON.Feature): Location | null {
    const geoPosition = GeoPosition.initWithFeature(feature)
    if (geoPosition === null) {
      return null
    }

    const attrs = feature.properties
    if (attrs === null) {
      return null
    }

    const location = new Location()
    location.geoPosition = geoPosition;
    location.locationName = attrs['locationName'] ?? null;

    const stopPlaceRef = attrs['stopPlace.stopPlaceRef'];
    if (stopPlaceRef) {
      const stopPlaceName = attrs['stopPlace.stopPlaceName'] ?? null;
      location.stopPlace = new StopPlace(stopPlaceRef, stopPlaceName, null)
    }

    const addressCode = attrs['addressCode'];
    if (addressCode) {
      const address = new Address(addressCode);
      address.addressName = attrs['addressName'] ?? null;
      address.topographicPlaceRef = attrs['topographicPlaceRef'] ?? null;
    }

    return location
  }

  public static initFromLiteralCoords(inputS: string): Location | null {
    let inputLiteralCoords = inputS.trim();
    // strip: parantheses (groups)
    inputLiteralCoords = inputLiteralCoords.replace(/\(.+?\)/g, '');
    // strip: characters NOT IN [0..9 , .]
    inputLiteralCoords = inputLiteralCoords.replace(/[^0-9\.,]/g, '');

    const inputMatches = inputLiteralCoords.match(literalCoordsRegexp);
    if (inputMatches === null) {
      return null
    }

    let longitude = parseFloat(inputMatches[1])
    let latitude = parseFloat(inputMatches[2])
    // In CH always long < lat
    if (longitude > latitude) {
      longitude = parseFloat(inputMatches[2])
      latitude = parseFloat(inputMatches[1])
    }
    
    const location = Location.initWithLngLat(longitude, latitude)

    // Match the content inside the ()
    const locationNameMatches = inputS.trim().match(/\(([^\)]*)\)?/);
    if (locationNameMatches !== null) {
      const locationName = locationNameMatches[1];
      location.locationName = locationName;
    }
    
    return location
  }

  asGeoJSONFeature(): GeoJSON.Feature<GeoJSON.Point> | null {
    if (this.geoPosition === null) {
      return null
    }

    const featureProperties: GeoJSON.GeoJsonProperties = {
    };

    const stopPlaceRef = this.stopPlace?.stopPlaceRef ?? null;
    if (stopPlaceRef) {
      featureProperties['stopPlace.stopPlaceRef'] = this.stopPlace?.stopPlaceRef ?? ''
      featureProperties['stopPlace.stopPlaceName'] = this.stopPlace?.stopPlaceName ?? ''
      featureProperties['stopPlace.topographicPlaceRef'] = this.stopPlace?.topographicPlaceRef ?? ''
    }

    if (this.address) {
      featureProperties['addressCode'] = this.address?.addressCode ?? ''
      featureProperties['addressName'] = this.address?.addressName ?? ''
      featureProperties['topographicPlaceRef'] = this.address?.topographicPlaceRef ?? ''
    }

    if (this.poi) {
      featureProperties['poi.name'] = this.poi.name;
      featureProperties['poi.code'] = this.poi.code;
      featureProperties['poi.category'] = this.poi.category;
      featureProperties['poi.subcategory'] = this.poi.subCategory;
      featureProperties['poi.osm.tags'] = this.poi.categoryTags.join(',');
    }

    featureProperties['locationName'] = this.locationName ?? '';

    for (let attrKey in this.attributes) {
      featureProperties['OJP.Attr.' + attrKey] = this.attributes[attrKey]
    }

    const feature: GeoJSON.Feature<GeoJSON.Point> = {
      type: 'Feature',
      properties: featureProperties,
      geometry: {
        type: 'Point',
        coordinates: [
          this.geoPosition.longitude,
          this.geoPosition.latitude
        ]
      }
    }

    return feature
  }

  public computeLocationName(includeLiteralCoords: boolean = true): string | null {
    if (this.stopPlace?.stopPlaceName) {
      return this.stopPlace.stopPlaceName;
    }

    if (this.topographicPlace?.name) {
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

  public findClosestLocation(otherLocations: Location[]): NearbyLocation | null {
    const geoPositionA = this.geoPosition;
    if (geoPositionA === null) {
      return null;
    }

    let closestLocation: NearbyLocation | null = null;

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
        }
      }
    });

    return closestLocation;
  }

  public getLocationType(): LocationType | null {
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

    return null
  }

  public patchWithAnotherLocation(anotherLocation: Location) {
    this.locationName = anotherLocation.locationName;
    this.stopPlace = anotherLocation.stopPlace;
    this.geoPosition = anotherLocation.geoPosition;
  }
}
