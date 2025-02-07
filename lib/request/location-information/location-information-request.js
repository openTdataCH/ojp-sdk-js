import { EMPTY_API_CONFIG } from '../../types/stage-config';
import { OJPBaseRequest } from '../base-request';
import { LocationInformationParser } from './location-information-parser';
import { LocationInformationRequestParams } from './location-information-request-params';
export class LocationInformationRequest extends OJPBaseRequest {
    constructor(stageConfig, requestParams) {
        super(stageConfig);
        this.requestParams = requestParams;
        this.requestInfo.requestXML = this.buildRequestXML();
    }
    static initWithResponseMock(mockText) {
        const emptyRequestParams = new LocationInformationRequestParams('en');
        const request = new LocationInformationRequest(EMPTY_API_CONFIG, emptyRequestParams);
        request.mockResponseXML = mockText;
        return request;
    }
    static initWithRequestMock(mockText, stageConfig = EMPTY_API_CONFIG) {
        const emptyRequestParams = new LocationInformationRequestParams('en');
        const request = new LocationInformationRequest(stageConfig, emptyRequestParams);
        request.mockRequestXML = mockText;
        return request;
    }
    static initWithLocationName(stageConfig, language, locationName, restrictionTypes, limit = 10) {
        const requestParams = LocationInformationRequestParams.initWithLocationName(language, locationName, restrictionTypes, limit);
        const request = new LocationInformationRequest(stageConfig, requestParams);
        return request;
    }
    static initWithStopPlaceRef(stageConfig, language, stopPlaceRef) {
        const requestParams = LocationInformationRequestParams.initWithStopPlaceRef(language, stopPlaceRef);
        const request = new LocationInformationRequest(stageConfig, requestParams);
        return request;
    }
    static initWithCircleLngLatRadius(stageConfig, language, circleLongitude, circleLatitude, circleRadius, restrictionTypes = [], numberOfResults = 1000) {
        const requestParams = LocationInformationRequestParams.initWithCircleLngLatRadius(language, circleLongitude, circleLatitude, circleRadius, restrictionTypes, numberOfResults);
        const request = new LocationInformationRequest(stageConfig, requestParams);
        return request;
    }
    static initWithBBOXAndType(stageConfig, language, bboxWest, bboxNorth, bboxEast, bboxSouth, restrictionTypes, limit = 1000, poiRestriction = null) {
        const requestParams = LocationInformationRequestParams.initWithBBOXAndType(language, bboxWest, bboxNorth, bboxEast, bboxSouth, restrictionTypes, limit, poiRestriction);
        const request = new LocationInformationRequest(stageConfig, requestParams);
        return request;
    }
    buildRequestXML() {
        return this.requestParams.buildRequestXML();
    }
    async fetchResponse() {
        await this.fetchOJPResponse();
        const promise = new Promise((resolve) => {
            const response = {
                locations: [],
                message: null,
            };
            if (this.requestInfo.error !== null || this.requestInfo.responseXML === null) {
                response.message = 'ERROR';
                resolve(response);
                return;
            }
            const parser = new LocationInformationParser();
            parser.callback = ({ locations, message }) => {
                response.locations = locations;
                response.message = message;
                if (message === 'LocationInformation.DONE') {
                    this.requestInfo.parseDateTime = new Date();
                }
                resolve(response);
            };
            parser.parseXML(this.requestInfo.responseXML);
        });
        return promise;
    }
    async fetchLocations() {
        const apiPromise = await this.fetchResponse();
        const promise = new Promise((resolve) => {
            if (apiPromise.message === 'LocationInformation.DONE') {
                resolve(apiPromise.locations);
            }
        });
        return promise;
    }
}
