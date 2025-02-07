import { PublicTransportMode } from './public-transport-mode';
import { StopPlace } from '../location/stopplace';
export class JourneyService {
    constructor(journeyRef, ptMode, agencyCode) {
        this.journeyRef = journeyRef;
        this.lineRef = null;
        this.operatingDayRef = null;
        this.directionRef = null;
        this.ptMode = ptMode;
        this.agencyCode = agencyCode;
        this.originStopPlace = null;
        this.destinationStopPlace = null;
        this.serviceLineNumber = null;
        this.journeyNumber = null;
        this.siriSituationIds = [];
        this.siriSituations = [];
        this.serviceAttributes = {};
        this.hasCancellation = null;
        this.hasDeviation = null;
        this.isUnplanned = null;
    }
    static initWithTreeNode(treeNode) {
        const serviceTreeNode = treeNode.findChildNamed('Service');
        if (serviceTreeNode === null) {
            return null;
        }
        const journeyRef = serviceTreeNode.findTextFromChildNamed('JourneyRef');
        const ptMode = PublicTransportMode.initWithServiceTreeNode(serviceTreeNode);
        const agencyCode = (() => {
            const ojpAgencyId = serviceTreeNode.findTextFromChildNamed('siri:OperatorRef');
            if (ojpAgencyId === null) {
                return 'n/a OperatorRef';
            }
            return ojpAgencyId.replace('ojp:', '');
        })();
        if (!(journeyRef && ptMode)) {
            return null;
        }
        const legService = new JourneyService(journeyRef, ptMode, agencyCode);
        legService.lineRef = serviceTreeNode.findTextFromChildNamed('siri:LineRef');
        legService.directionRef = serviceTreeNode.findTextFromChildNamed('siri:DirectionRef');
        legService.operatingDayRef = serviceTreeNode.findTextFromChildNamed('OperatingDayRef');
        legService.originStopPlace = StopPlace.initWithServiceTreeNode(serviceTreeNode, 'Origin');
        legService.destinationStopPlace = StopPlace.initWithServiceTreeNode(serviceTreeNode, 'Destination');
        legService.serviceLineNumber = serviceTreeNode.findTextFromChildNamed('PublishedServiceName/Text');
        legService.journeyNumber = serviceTreeNode.findTextFromChildNamed('TrainNumber');
        legService.siriSituationIds = [];
        const situationsContainerNode = serviceTreeNode.findChildNamed('SituationFullRefs');
        if (situationsContainerNode) {
            const situationFullRefTreeNodes = situationsContainerNode.findChildrenNamed('SituationFullRef');
            situationFullRefTreeNodes.forEach(situationFullRefTreeNode => {
                const situationNumber = situationFullRefTreeNode.findTextFromChildNamed('siri:SituationNumber');
                if (situationNumber) {
                    legService.siriSituationIds.push(situationNumber);
                }
            });
        }
        legService.serviceAttributes = {};
        serviceTreeNode.findChildrenNamed('Attribute').forEach(attributeTreeNode => {
            let code = attributeTreeNode.findTextFromChildNamed('Code');
            if (code === null) {
                console.error('ERROR - cant find code for Attribute');
                console.log(attributeTreeNode);
                return;
            }
            if (code.startsWith('A_')) {
                // normalize HRDF *A attributes, strip A__ chars
                code = code.replace(/A_*/, '');
            }
            const text = attributeTreeNode.findTextFromChildNamed('UserText/Text');
            if (text === null) {
                console.error('ERROR - cant find code/text for Attribute');
                console.log(attributeTreeNode);
                return;
            }
            const serviceAttribute = {
                code: code,
                text: text,
                extra: {},
            };
            attributeTreeNode.children.forEach(childTreeNode => {
                if (childTreeNode.name.startsWith('siri:')) {
                    const extraAttributeParts = childTreeNode.name.split('siri:');
                    if (extraAttributeParts.length !== 2) {
                        return;
                    }
                    const extraAttributeKey = extraAttributeParts[1];
                    const extraAttributeValue = childTreeNode.text;
                    if (extraAttributeValue === null) {
                        return;
                    }
                    serviceAttribute.extra[extraAttributeKey] = extraAttributeValue;
                }
            });
            legService.serviceAttributes[code] = serviceAttribute;
        });
        const cancelledNode = serviceTreeNode.findChildNamed('Cancelled');
        if (cancelledNode) {
            legService.hasCancellation = cancelledNode.text === 'true';
        }
        const deviationNode = serviceTreeNode.findChildNamed('Deviation');
        if (deviationNode) {
            legService.hasDeviation = deviationNode.text === 'true';
        }
        const unplannedNode = serviceTreeNode.findChildNamed('Unplanned');
        if (unplannedNode) {
            legService.isUnplanned = unplannedNode.text === 'true';
        }
        return legService;
    }
    formatServiceName() {
        var _a, _b, _c, _d;
        if (this.ptMode.isDemandMode) {
            return (_a = this.serviceLineNumber) !== null && _a !== void 0 ? _a : 'OnDemand';
        }
        const nameParts = [];
        if (this.serviceLineNumber) {
            if (!this.ptMode.isRail()) {
                nameParts.push((_b = this.ptMode.shortName) !== null && _b !== void 0 ? _b : this.ptMode.ptMode);
            }
            nameParts.push(this.serviceLineNumber);
            nameParts.push((_c = this.journeyNumber) !== null && _c !== void 0 ? _c : '');
        }
        else {
            nameParts.push((_d = this.ptMode.shortName) !== null && _d !== void 0 ? _d : this.ptMode.ptMode);
        }
        nameParts.push('(' + this.agencyCode + ')');
        return nameParts.join(' ');
    }
    addToXMLNode(parentNode) {
        const serviceNode = parentNode.ele('ojp:Service');
        serviceNode.ele('ojp:JourneyRef', this.journeyRef);
        if (this.lineRef) {
            serviceNode.ele('LineRef', this.lineRef);
        }
        if (this.directionRef) {
            serviceNode.ele('DirectionRef', this.directionRef);
        }
        this.ptMode.addToXMLNode(serviceNode);
        if (this.serviceLineNumber) {
            serviceNode.ele('ojp:PublishedLineName').ele('ojp:Text', this.serviceLineNumber);
        }
        let agencyID_s = this.agencyCode;
        if (!agencyID_s.startsWith('ojp:')) {
            agencyID_s = 'ojp:' + agencyID_s;
        }
        serviceNode.ele('ojp:OperatorRef', agencyID_s);
    }
}
