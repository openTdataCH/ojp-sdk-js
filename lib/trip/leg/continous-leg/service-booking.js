export class ServiceBooking {
    constructor(bookingArrangements) {
        this.bookingArrangements = bookingArrangements;
    }
    static initWithLegTreeNode(legTreeNode) {
        const bookingArrangementsTreeNode = legTreeNode.findChildNamed('Service/BookingArrangements');
        if (bookingArrangementsTreeNode === null) {
            return null;
        }
        const bookingArrangementTreeNodes = bookingArrangementsTreeNode.findChildrenNamed('BookingArrangement');
        if (bookingArrangementTreeNodes.length === 0) {
            console.error('ERROR - no BookingArrangements nodes found');
            return null;
        }
        const bookingArrangements = [];
        bookingArrangementTreeNodes.forEach(bookingArrangementTreeNode => {
            const agencyCode = bookingArrangementTreeNode.findTextFromChildNamed('BookingAgencyName/Text');
            let infoURL = bookingArrangementTreeNode.findTextFromChildNamed('InfoUrl');
            if ((agencyCode === null) || (infoURL === null)) {
                return;
            }
            infoURL = infoURL.trim();
            if (infoURL.length < 2) {
                return;
            }
            // strip out <>
            if (infoURL[0] === '<') {
                infoURL = infoURL.substring(1, infoURL.length - 1);
            }
            var el = document.createElement('textarea');
            el.innerHTML = infoURL.trim();
            infoURL = el.innerText;
            const bookingArrangement = {
                agencyCode: agencyCode.trim(),
                agencyName: ServiceBooking.computeAgencyName(agencyCode),
                infoURL: infoURL,
            };
            bookingArrangements.push(bookingArrangement);
        });
        const serviceBooking = new ServiceBooking(bookingArrangements);
        return serviceBooking;
    }
    static computeAgencyName(agencyCode) {
        agencyCode = agencyCode.trim();
        if (agencyCode.endsWith('_local.ch')) {
            return 'local.ch';
        }
        if (agencyCode.endsWith('_maps.google.ch')) {
            return 'maps.google.com';
        }
        if (agencyCode.endsWith('_openstreetmap.org')) {
            return 'openstreetmap.org';
        }
        return 'n/a catalog: ' + agencyCode;
    }
}
