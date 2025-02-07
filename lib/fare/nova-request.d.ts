import { RequestInfo } from "../request";
import { Trip } from "../trip";
import { NovaFare_Response } from "./nova-request-parser";
import { ApiConfig } from '../types/stage-config';
export declare class NovaRequest {
    private stageConfig;
    requestInfo: RequestInfo;
    constructor(stageConfig: ApiConfig);
    fetchResponseForTrips(trips: Trip[]): Promise<NovaFare_Response>;
    private buildServiceRequestNode;
    private addTripToServiceRequestNode;
    private fetchResponse;
}
