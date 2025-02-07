import { BaseParser } from "../request/base-parser";
import { FareResult } from "./fare";
type NovaFare_ParserMessage = "NovaFares.DONE" | "ERROR";
export type NovaFare_Response = {
    fareResults: FareResult[];
    message: NovaFare_ParserMessage | null;
};
export type NovaFare_Callback = (response: NovaFare_Response) => void;
export declare class NovaFareParser extends BaseParser {
    callback: NovaFare_Callback | null;
    fareResults: FareResult[];
    constructor();
    parseXML(responseXMLText: string): void;
    protected onCloseTag(nodeName: string): void;
    protected onError(saxError: any): void;
    protected onEnd(): void;
}
export {};
