import { StopEvent } from "../../stop-event/stop-event";
import { BaseParser } from "../base-parser";
import { StopEventRequest_Callback as ParserCallback } from "../types/stop-event-request.type";
export declare class StopEventRequestParser extends BaseParser {
    stopEvents: StopEvent[];
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
