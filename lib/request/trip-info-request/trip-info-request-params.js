import { BaseRequestParams } from '../base-request-params';
export class TripInfoRequestParams extends BaseRequestParams {
    constructor(language, journeyRef, operatingDayRef) {
        super(language);
        this.journeyRef = journeyRef;
        this.operatingDayRef = operatingDayRef;
    }
    static Empty() {
        const requestParams = new TripInfoRequestParams('en', 'n/a', 'n/a');
        return requestParams;
    }
    buildRequestNode() {
        super.buildRequestNode();
        const dateNowF = new Date().toISOString();
        this.serviceRequestNode.ele('siri:RequestTimestamp', dateNowF);
        this.serviceRequestNode.ele("siri:RequestorRef", BaseRequestParams.buildRequestorRef());
        const requestNode = this.serviceRequestNode.ele('OJPTripInfoRequest');
        requestNode.ele('siri:RequestTimestamp', dateNowF);
        requestNode.ele('JourneyRef', this.journeyRef);
        requestNode.ele('OperatingDayRef', this.operatingDayRef);
        const paramsNode = requestNode.ele('Params');
        paramsNode.ele('IncludeCalls', true);
        paramsNode.ele('IncludeService', true);
    }
}
