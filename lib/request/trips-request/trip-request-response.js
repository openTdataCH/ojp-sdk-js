import * as xmlbuilder from "xmlbuilder";
// This is different than `TripRequest_Response` 
//    because of the XML serialisation which is done here
export class TripRequestResponse {
    constructor(trips) {
        this.trips = trips;
    }
    asXML() {
        const rootNode = xmlbuilder.create("siri:OJP", {
            version: "1.0",
            encoding: "utf-8",
        });
        rootNode.att("xmlns:ojp", "http://www.vdv.de/ojp");
        rootNode.att("xmlns:siri", "http://www.siri.org.uk/siri");
        rootNode.att("version", "1.0");
        const tripDeliveryNode = rootNode
            .ele("siri:OJPResponse")
            .ele("siri:ServiceDelivery")
            .ele("ojp:OJPTripDelivery");
        this.trips.forEach(trip => {
            const tripResultNode = tripDeliveryNode.ele('ojp:TripResult');
            tripResultNode.ele('ojp:ResultId', trip.id);
            trip.addToXMLNode(tripResultNode);
        });
        const bodyXML_s = tripDeliveryNode.end({
            pretty: true
        });
        return bodyXML_s;
    }
}
