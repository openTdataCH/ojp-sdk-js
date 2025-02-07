import { XMLElement } from 'xmlbuilder';

import { PublicTransportMode } from './public-transport-mode'

import { StopPlace } from '../location/stopplace';
import { PtSituationElement } from '../situation/situation-element';
import { TreeNode } from '../xml/tree-node';

interface ServiceAttribute {
  code: string
  text: string
  extra: Record<string, string>
}

export class JourneyService {
  public journeyRef: string;
  public lineRef: string | null;
  public directionRef: string | null;
  public operatingDayRef: string | null;

  public ptMode: PublicTransportMode;
  public agencyCode: string;
  public originStopPlace: StopPlace | null;
  public destinationStopPlace: StopPlace | null;
  public serviceLineNumber: string | null
  public journeyNumber: string | null
  
  public siriSituationIds: string[]
  public siriSituations: PtSituationElement[]

  public serviceAttributes: Record<string, ServiceAttribute>

  public hasCancellation: boolean | null
  public hasDeviation: boolean | null
  public isUnplanned: boolean | null

  constructor(journeyRef: string, ptMode: PublicTransportMode, agencyCode: string) {
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

  public static initWithTreeNode(treeNode: TreeNode): JourneyService | null {
    const serviceTreeNode = treeNode.findChildNamed('Service');
    if (serviceTreeNode === null) {
      return null;
    }

    const journeyRef = serviceTreeNode.findTextFromChildNamed('JourneyRef');
    const ptMode = PublicTransportMode.initWithServiceTreeNode(serviceTreeNode);

    
    const agencyCode = (() => {
      const ojpAgencyId = serviceTreeNode.findTextFromChildNamed('siri:OperatorRef');
      if (ojpAgencyId === null) {
        return 'n/a OperatorRef'
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

      const serviceAttribute: ServiceAttribute = {
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

  public formatServiceName(): string {
    if (this.ptMode.isDemandMode) {
      return this.serviceLineNumber ?? 'OnDemand';
    }

    const nameParts: string[] = []

    if (this.serviceLineNumber) {
      if (!this.ptMode.isRail()) {
        nameParts.push(this.ptMode.shortName ?? this.ptMode.ptMode)
      }

      nameParts.push(this.serviceLineNumber)
      nameParts.push(this.journeyNumber ?? '')
    } else {
      nameParts.push(this.ptMode.shortName ?? this.ptMode.ptMode)
    }

    nameParts.push('(' + this.agencyCode + ')')

    return nameParts.join(' ')
  }

  public addToXMLNode(parentNode: XMLElement) {
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
