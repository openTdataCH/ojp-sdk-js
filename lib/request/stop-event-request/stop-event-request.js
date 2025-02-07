import { EMPTY_API_CONFIG } from '../../types/stage-config';
import { OJPBaseRequest } from '../base-request';
import { StopEventRequestParams } from './stop-event-request-params';
import { StopEventRequestParser } from './stop-event-request-parser';
export class StopEventRequest extends OJPBaseRequest {
    constructor(stageConfig, requestParams) {
        requestParams.includePreviousCalls = true;
        requestParams.includeOnwardCalls = true;
        super(stageConfig);
        this.requestParams = requestParams;
        this.requestInfo.requestXML = this.buildRequestXML();
    }
    static Empty(stageConfig = EMPTY_API_CONFIG) {
        const emptyRequestParams = StopEventRequestParams.Empty();
        const request = new StopEventRequest(stageConfig, emptyRequestParams);
        return request;
    }
    static initWithMock(mockText) {
        const request = StopEventRequest.Empty();
        request.mockResponseXML = mockText;
        return request;
    }
    static initWithRequestMock(mockText, stageConfig = EMPTY_API_CONFIG) {
        const request = StopEventRequest.Empty(stageConfig);
        request.mockRequestXML = mockText;
        return request;
    }
    static initWithStopPlaceRef(stageConfig, language, stopPlaceRef, stopEventType, stopEventDate) {
        const stopEventRequestParams = new StopEventRequestParams(language, stopPlaceRef, null, stopEventType, stopEventDate);
        const stopEventRequest = new StopEventRequest(stageConfig, stopEventRequestParams);
        return stopEventRequest;
    }
    buildRequestXML() {
        return this.requestParams.buildRequestXML();
    }
    async fetchResponse() {
        await this.fetchOJPResponse();
        const promise = new Promise((resolve) => {
            const response = {
                stopEvents: [],
                message: null,
            };
            if (this.requestInfo.error !== null || this.requestInfo.responseXML === null) {
                response.message = 'ERROR';
                resolve(response);
                return;
            }
            const parser = new StopEventRequestParser();
            parser.callback = ({ stopEvents, message }) => {
                response.stopEvents = stopEvents;
                response.message = message;
                if (message === 'StopEvent.DONE') {
                    this.requestInfo.parseDateTime = new Date();
                    resolve(response);
                }
            };
            parser.parseXML(this.requestInfo.responseXML);
        });
        return promise;
    }
}
