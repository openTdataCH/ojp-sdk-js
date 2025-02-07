import { OJPBaseRequest } from '../base-request';
import { TripsRequestParams } from './trips-request-params';
import { ApiConfig } from '../../types/stage-config';
import { TripRequest_Response, TripRequest_Callback } from '../types/trip-request.type';
import { TripLocationPoint } from '../../trip';
import { Location } from '../../location/location';
import { Language } from '../../types/language-type';
import { TripModeType } from '../../types/trip-mode-type';
import { IndividualTransportMode } from '../../types/individual-mode.types';
import { ModeOfTransportType } from '../../types/mode-of-transport.type';
export type TripRequestBoardingType = 'Dep' | 'Arr';
export declare class TripRequest extends OJPBaseRequest {
    private requestParams;
    response: TripRequest_Response | null;
    constructor(stageConfig: ApiConfig, requestParams: TripsRequestParams);
    static initWithResponseMock(mockText: string): TripRequest;
    static initWithRequestMock(mockText: string, stageConfig?: ApiConfig): TripRequest;
    static initWithStopRefs(stageConfig: ApiConfig, language: Language, fromStopRef: string, toStopRef: string, departureDate?: Date, tripRequestBoardingType?: TripRequestBoardingType): TripRequest | null;
    static initWithLocationsAndDate(stageConfig: ApiConfig, language: Language, fromLocation: Location, toLocation: Location, departureDate: Date, tripRequestBoardingType?: TripRequestBoardingType): TripRequest | null;
    static initWithTripLocationsAndDate(stageConfig: ApiConfig, language: Language, fromTripLocation: TripLocationPoint | null, toTripLocation: TripLocationPoint | null, departureDate: Date, tripRequestBoardingType?: TripRequestBoardingType, includeLegProjection?: boolean, modeType?: TripModeType, transportMode?: IndividualTransportMode, viaTripLocations?: TripLocationPoint[], numberOfResults?: number | null, numberOfResultsBefore?: number | null, numberOfResultsAfter?: number | null, publicTransportModes?: ModeOfTransportType[]): TripRequest | null;
    protected buildRequestXML(): string;
    fetchResponse(): Promise<TripRequest_Response>;
    fetchResponseWithCallback(callback: TripRequest_Callback): void;
    private parseTripRequestResponse;
}
