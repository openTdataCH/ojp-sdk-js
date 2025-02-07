type POI_OSM_TagSharedMobility = 'escooter_rental' | 'car_sharing' | 'bicycle_rental' | 'charging_station';
type POI_OSM_TagPOI = 'service' | 'shopping' | 'leisure' | 'catering' | 'public' | 'parkride' | 'accommodation' | 'sbb_services' | 'other';
export type RestrictionPoiOSMTag = POI_OSM_TagSharedMobility | POI_OSM_TagPOI | 'none';
export type POI_Restriction = {
    poiType: 'shared_mobility' | 'poi';
    tags: RestrictionPoiOSMTag[];
};
export type RestrictionType = 'stop' | 'address' | 'coord' | 'location' | 'topographicPlace' | 'poi';
export {};
