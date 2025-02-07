import { BaseRequestParams } from '../base-request-params';
export class StopEventRequestParams extends BaseRequestParams {
    constructor(language, stopPlaceRef, geoPosition, stopEventType, stopEventDate) {
        super(language);
        this.stopPlaceRef = stopPlaceRef;
        this.geoPosition = geoPosition;
        this.depArrTime = stopEventDate;
        this.numberOfResults = 10;
        this.stopEventType = stopEventType;
        this.includePreviousCalls = false;
        this.includeOnwardCalls = false;
        this.includeRealtimeData = true;
    }
    static Empty() {
        const stopEventRequestParams = new StopEventRequestParams('en', null, null, 'departure', new Date());
        return stopEventRequestParams;
    }
    buildRequestNode() {
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
