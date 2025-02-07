import { Location } from "../../location/location";
import { BaseParser } from "../base-parser";
export class LocationInformationParser extends BaseParser {
    constructor() {
        super();
        this.callback = null;
        this.locations = [];
    }
    parseXML(responseXMLText) {
        this.locations = [];
        super.parseXML(responseXMLText);
    }
    onCloseTag(nodeName) {
        if (nodeName === 'PlaceResult' && this.currentNode.parentName === 'OJPLocationInformationDelivery') {
            const location = Location.initWithLocationResultTreeNode(this.currentNode);
            if (location) {
                this.locations.push(location);
            }
        }
    }
    onError(saxError) {
        console.error('ERROR: SAX parser');
        console.log(saxError);
        if (this.callback) {
            this.callback({
                locations: this.locations,
                message: 'ERROR',
            });
        }
    }
    onEnd() {
        if (this.callback) {
            this.callback({
                locations: this.locations,
                message: 'LocationInformation.DONE',
            });
        }
    }
}
