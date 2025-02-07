import * as xmlbuilder from "xmlbuilder";
import { Language } from "../types/language-type";
export declare class BaseRequestParams {
    private language;
    protected serviceRequestNode: xmlbuilder.XMLElement;
    constructor(language: Language);
    private computeBaseServiceRequestNode;
    static buildRequestorRef(): string;
    protected buildRequestNode(): void;
    buildRequestXML(): string;
}
