import { ApiConfig } from '../../types/stage-config';
import { OJPBaseRequest } from '../base-request';
import { StopEventRequestParams } from './stop-event-request-params';
import { StopEventType } from '../../types/stop-event-type';
import { StopEventRequest_Response } from '../types/stop-event-request.type';
import { Language } from '../../types/language-type';
export declare class StopEventRequest extends OJPBaseRequest {
    requestParams: StopEventRequestParams;
    constructor(stageConfig: ApiConfig, requestParams: StopEventRequestParams);
    static Empty(stageConfig?: ApiConfig): StopEventRequest;
    static initWithMock(mockText: string): StopEventRequest;
    static initWithRequestMock(mockText: string, stageConfig?: ApiConfig): StopEventRequest;
    static initWithStopPlaceRef(stageConfig: ApiConfig, language: Language, stopPlaceRef: string, stopEventType: StopEventType, stopEventDate: Date): StopEventRequest;
    protected buildRequestXML(): string;
    fetchResponse(): Promise<StopEventRequest_Response>;
}
