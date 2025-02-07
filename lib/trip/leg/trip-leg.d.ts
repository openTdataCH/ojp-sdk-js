import * as GeoJSON from 'geojson';
import { XMLElement } from 'xmlbuilder';
import { Location } from '../../location/location';
import { LegTrack } from './leg-track';
import { StopPointType } from '../../types/stop-point-type';
import { Duration } from '../../shared/duration';
import { PtSituationElement } from '../../situation/situation-element';
export type LegType = 'ContinousLeg' | 'TimedLeg' | 'TransferLeg';
export interface LinePointData {
    type: StopPointType;
    feature: GeoJSON.Feature<GeoJSON.Point>;
}
export declare class TripLeg {
    legType: LegType;
    legID: number;
    fromLocation: Location;
    toLocation: Location;
    legTrack: LegTrack | null;
    legDuration: Duration | null;
    constructor(legType: LegType, legIDx: number, fromLocation: Location, toLocation: Location);
    patchLocations(mapContextLocations: Record<string, Location>): void;
    patchSituations(mapContextSituations: Record<string, PtSituationElement>): void;
    protected patchLocation(location: Location, mapContextLocations: Record<string, Location>): void;
    addToXMLNode(parentNode: XMLElement): void;
}
