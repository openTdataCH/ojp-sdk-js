import { BaseParser } from "./base-parser";
export class XMLParser extends BaseParser {
    constructor() {
        super(...arguments);
        this.callback = null;
    }
    parseXML(responseXMLText) {
        super.parseXML(responseXMLText);
    }
    onError(saxError) {
        console.error('ERROR: SAX parser');
        console.log(saxError);
        if (this.callback) {
            this.callback({
                message: 'ERROR',
                rootNode: this.rootNode,
            });
        }
    }
    onEnd() {
        if (this.callback) {
            this.callback({
                message: 'DONE',
                rootNode: this.rootNode,
            });
        }
    }
}
