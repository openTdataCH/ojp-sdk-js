import { EMPTY_API_CONFIG } from '../../types/stage-config';
import { OJPBaseRequest } from '../base-request';
import { TripInfoRequestParams } from './trip-info-request-params';
import { TripInfoRequestParser } from './trip-info-request-parser';
export class TripInfoRequest extends OJPBaseRequest {
    constructor(stageConfig, requestParams) {
        super(stageConfig);
        this.requestParams = requestParams;
        this.requestInfo.requestXML = this.buildRequestXML();
    }
    static Empty(stageConfig = EMPTY_API_CONFIG) {
        const emptyRequestParams = TripInfoRequestParams.Empty();
        const request = new TripInfoRequest(stageConfig, emptyRequestParams);
        return request;
    }
    static initWithMock(mockText) {
        const request = TripInfoRequest.Empty();
        request.mockResponseXML = mockText;
        return request;
    }
    static initWithRequestMock(mockText, stageConfig = EMPTY_API_CONFIG) {
        const request = TripInfoRequest.Empty(stageConfig);
        request.mockRequestXML = mockText;
        return request;
    }
    static initWithJourneyRef(stageConfig, language, journeyRef, operatingDayRef = null) {
        if (operatingDayRef === null) {
            const dateNowF = new Date().toISOString();
            operatingDayRef = dateNowF.substring(0, 10);
        }
        const requestParams = new TripInfoRequestParams(language, journeyRef, operatingDayRef);
        const request = new TripInfoRequest(stageConfig, requestParams);
        return request;
    }
    buildRequestXML() {
        return this.requestParams.buildRequestXML();
    }
    async fetchResponse() {
        await this.fetchOJPResponse();
        const promise = new Promise((resolve) => {
            const response = {
                tripInfoResult: null,
                message: null,
            };
            if (this.requestInfo.error !== null || this.requestInfo.responseXML === null) {
                response.message = 'ERROR';
                resolve(response);
                return;
            }
            const parser = new TripInfoRequestParser();
            parser.callback = ({ tripInfoResult, message }) => {
                response.tripInfoResult = tripInfoResult;
                response.message = message;
                if (message === 'TripInfoRequest.DONE') {
                    this.requestInfo.parseDateTime = new Date();
                    resolve(response);
                }
            };
            parser.parseXML(this.requestInfo.responseXML);
        });
        return promise;
    }
}
