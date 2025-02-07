import { ApiConfig } from '../types/stage-config';
import { RequestInfo } from './types/request-info.type';
export declare class OJPBaseRequest {
    private stageConfig;
    requestInfo: RequestInfo;
    protected logRequests: boolean;
    protected mockRequestXML: string | null;
    protected mockResponseXML: string | null;
    constructor(stageConfig: ApiConfig);
    protected buildRequestXML(): string;
    protected fetchOJPResponse(): Promise<RequestInfo>;
}
