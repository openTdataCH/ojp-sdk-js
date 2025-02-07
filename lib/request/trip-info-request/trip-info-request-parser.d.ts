import { TripInfoResult } from "../../trip/trip-info/trip-info-result";
import { BaseParser } from "../base-parser";
import { TripInfoRequest_Callback as ParserCallback } from "../types/trip-info-request.type";
export declare class TripInfoRequestParser extends BaseParser {
    tripInfoResult: TripInfoResult | null;
    private mapContextLocations;
    private mapContextSituations;
    callback: ParserCallback | null;
    constructor();
    private reset;
    parseXML(responseXMLText: string): void;
    protected onCloseTag(nodeName: string): void;
    protected onEnd(): void;
}
