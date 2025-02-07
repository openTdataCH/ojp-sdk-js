import { BaseParser } from "../base-parser";
import { TripRequest_Callback as ParserCallback } from "../types/trip-request.type";
export declare class TripRequestParser extends BaseParser {
    private trips;
    private tripsNo;
    private mapContextLocations;
    private mapContextSituations;
    callback: ParserCallback | null;
    constructor();
    private reset;
    parseXML(responseXMLText: string): void;
    protected onCloseTag(nodeName: string): void;
    protected onEnd(): void;
    private validateSituations;
}
