import { GeoPosition } from "../../location/geoposition"
import { Language } from "../../types/language-type";
import { StopEventType } from "../../types/stop-event-type"
import { BaseRequestParams } from '../base-request-params';

export class StopEventRequestParams extends BaseRequestParams {
    public stopPlaceRef: string | null
    public geoPosition: GeoPosition | null
    public depArrTime: Date
    public numberOfResults: number
    public stopEventType: StopEventType
    public includePreviousCalls: boolean
    public includeOnwardCalls: boolean
    public includeRealtimeData: boolean

    constructor(language: Language, stopPlaceRef: string | null, geoPosition: GeoPosition | null, stopEventType: StopEventType, stopEventDate: Date) {
        super(language);

        this.stopPlaceRef = stopPlaceRef;
        this.geoPosition = geoPosition;
        this.depArrTime = stopEventDate;
        this.numberOfResults = 10;
        this.stopEventType = stopEventType
        this.includePreviousCalls = false;
        this.includeOnwardCalls = false;
        this.includeRealtimeData = true;
    }

    public static Empty(): StopEventRequestParams {
        const stopEventRequestParams = new StopEventRequestParams('en', null, null, 'departure', new Date());
        return stopEventRequestParams;
    }

    protected buildRequestNode(): void {
        super.buildRequestNode();

        const dateNowF = new Date().toISOString();
        const dateF = this.depArrTime.toISOString();
       
        this.serviceRequestNode.ele('siri:RequestTimestamp', dateNowF);

        this.serviceRequestNode.ele("siri:RequestorRef", BaseRequestParams.buildRequestorRef());

        const requestNode = this.serviceRequestNode.ele('OJPStopEventRequest');
        requestNode.ele('siri:RequestTimestamp', dateNowF);

        const locationNode = requestNode.ele('Location');

        if (this.stopPlaceRef) {
            const requestPlaceRefNode = locationNode.ele('PlaceRef');
            requestPlaceRefNode.ele('siri:StopPointRef', this.stopPlaceRef);
            requestPlaceRefNode.ele('Name').ele('Text', 'n/a');
        }

        locationNode.ele('DepArrTime', dateF);

        const requestParamsNode = requestNode.ele('Params');

        requestParamsNode.ele('IncludeAllRestrictedLines', true);
        requestParamsNode.ele('NumberOfResults', this.numberOfResults);
        requestParamsNode.ele('StopEventType', this.stopEventType);
        requestParamsNode.ele('IncludePreviousCalls', this.includePreviousCalls);
        requestParamsNode.ele('IncludeOnwardCalls', this.includeOnwardCalls);
        requestParamsNode.ele('IncludeRealtimeData', this.includeRealtimeData);

        const extensionsNode = requestNode.ele('siri:Extensions');
        extensionsNode.ele('ParamsExtension').ele('PrivateModeFilter').ele('Exclude', 'false');
    }
}
