import { BaseParser } from "../request/base-parser";
import { FareResult } from "./fare";
export class NovaFareParser extends BaseParser {
    constructor() {
        super();
        this.callback = null;
        this.fareResults = [];
    }
    parseXML(responseXMLText) {
        this.fareResults = [];
        super.parseXML(responseXMLText);
    }
    onCloseTag(nodeName) {
        if (nodeName === "FareResult") {
            const fareResult = FareResult.initWithFareResultTreeNode(this.currentNode);
            if (fareResult) {
                this.fareResults.push(fareResult);
            }
        }
    }
    onError(saxError) {
        console.error("ERROR: SAX parser");
        console.log(saxError);
        if (this.callback) {
            this.callback({
                fareResults: this.fareResults,
                message: "ERROR",
            });
        }
    }
    onEnd() {
        if (this.callback) {
            this.callback({
                fareResults: this.fareResults,
                message: "NovaFares.DONE",
            });
        }
    }
}
