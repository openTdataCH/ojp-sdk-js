import { OJPBaseRequest } from '../base-request';
import { TripsRequestParams } from './trips-request-params';
import { EMPTY_API_CONFIG } from '../../types/stage-config';
import { TripRequestParser } from './trip-request-parser';
import { Location } from '../../location/location';
export class TripRequest extends OJPBaseRequest {
    constructor(stageConfig, requestParams) {
        super(stageConfig);
        this.requestParams = requestParams;
        this.response = null;
        this.requestInfo.requestXML = this.buildRequestXML();
    }
    static initWithResponseMock(mockText) {
        const emptyRequestParams = TripsRequestParams.Empty();
        const request = new TripRequest(EMPTY_API_CONFIG, emptyRequestParams);
        request.mockResponseXML = mockText;
        return request;
    }
    static initWithRequestMock(mockText, stageConfig = EMPTY_API_CONFIG) {
        const emptyRequestParams = TripsRequestParams.Empty();
        const request = new TripRequest(stageConfig, emptyRequestParams);
        request.mockRequestXML = mockText;
        return request;
    }
    static initWithStopRefs(stageConfig, language, fromStopRef, toStopRef, departureDate = new Date(), tripRequestBoardingType = 'Dep') {
        const fromLocation = Location.initWithStopPlaceRef(fromStopRef);
        const toLocation = Location.initWithStopPlaceRef(toStopRef);
        const requestParams = TripsRequestParams.initWithLocationsAndDate(language, fromLocation, toLocation, departureDate, tripRequestBoardingType);
        if (requestParams === null) {
            return null;
        }
        const request = new TripRequest(stageConfig, requestParams);
        return request;
    }
    static initWithLocationsAndDate(stageConfig, language, fromLocation, toLocation, departureDate, tripRequestBoardingType = 'Dep') {
        const requestParams = TripsRequestParams.initWithLocationsAndDate(language, fromLocation, toLocation, departureDate, tripRequestBoardingType);
        if (requestParams === null) {
            return null;
        }
        const request = new TripRequest(stageConfig, requestParams);
        return request;
    }
    static initWithTripLocationsAndDate(stageConfig, language, fromTripLocation, toTripLocation, departureDate, tripRequestBoardingType = 'Dep', includeLegProjection = false, modeType = 'monomodal', transportMode = 'public_transport', viaTripLocations = [], numberOfResults = null, numberOfResultsBefore = null, numberOfResultsAfter = null, publicTransportModes = []) {
        const requestParams = TripsRequestParams.initWithTripLocationsAndDate(language, fromTripLocation, toTripLocation, departureDate, tripRequestBoardingType, includeLegProjection, modeType, transportMode, viaTripLocations, numberOfResults, numberOfResultsBefore, numberOfResultsAfter, publicTransportModes);
        if (requestParams === null) {
            return null;
        }
        const request = new TripRequest(stageConfig, requestParams);
        return request;
    }
    buildRequestXML() {
        return this.requestParams.buildRequestXML();
    }
    async fetchResponse() {
        await this.fetchOJPResponse();
        const promise = new Promise((resolve) => {
            this.parseTripRequestResponse(resolve);
        });
        return promise;
    }
    fetchResponseWithCallback(callback) {
        this.fetchOJPResponse().then((requestInfo) => {
            this.requestInfo = requestInfo;
            this.parseTripRequestResponse(callback);
        });
    }
    parseTripRequestResponse(callback) {
        this.response = null;
        if (this.requestInfo.error !== null || this.requestInfo.responseXML === null) {
            const errorResponse = {
                tripsNo: 0,
                trips: [],
                message: null
            };
            errorResponse.message = 'ERROR';
            callback(errorResponse);
            return;
        }
        const parser = new TripRequestParser();
        parser.callback = (parserResponse) => {
            if (parserResponse.message === 'TripRequest.Trip' && parserResponse.trips.length === 1) {
                this.requestInfo.parseDateTime = new Date();
            }
            this.response = parserResponse;
            callback(parserResponse);
        };
        parser.parseXML(this.requestInfo.responseXML);
    }
}
