import { PublicTransportMode } from './public-transport-mode'
import { TripLegLineType } from "../types/map-geometry-types";

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
  public ptMode: PublicTransportMode;
  public agencyCode: string;
  public originStopPlace: StopPlace | null;
  public destinationStopPlace: StopPlace | null;
  public serviceLineNumber: string | null
  public journeyNumber: string | null
  
  public siriSituationIds: string[]
  public siriSituations: PtSituationElement[]

  public serviceAttributes: Record<string, ServiceAttribute>

  constructor(journeyRef: string, ptMode: PublicTransportMode, agencyCode: string) {
    this.journeyRef = journeyRef;
    this.ptMode = ptMode;
    this.agencyCode = agencyCode;
    
    this.originStopPlace = null;
    this.destinationStopPlace = null;
    this.serviceLineNumber = null;
    this.journeyNumber = null;

    this.siriSituationIds = [];
    this.siriSituations = [];

    this.serviceAttributes = {};
  }

  public static initWithTreeNode(treeNode: TreeNode): JourneyService | null {
    const serviceTreeNode = treeNode.findChildNamed('Service');
    if (serviceTreeNode === null) {
      return null;
    }

    const journeyRef = serviceTreeNode.findTextFromChildNamed('JourneyRef');
    const ptMode = PublicTransportMode.initWithServiceTreeNode(serviceTreeNode);

    // TODO - this should be renamed to code
    // <siri:LineRef>ojp:91036:A:H</siri:LineRef>
    // <siri:OperatorRef>SBB</siri:OperatorRef>
    // <PublicCode>InterRegio</PublicCode>
    const agencyCode = serviceTreeNode.findTextFromChildNamed('siri:OperatorRef');

    if (!(journeyRef && ptMode && agencyCode)) {
      return null;
    }

    const legService = new JourneyService(journeyRef, ptMode, agencyCode);

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

    return legService;
  }

  public computeLegLineType(): TripLegLineType {
    const isPostAuto = this.agencyCode === '801'
    if (isPostAuto) {
      return 'PostAuto'
    }

    if (this.ptMode.isRail()) {
      return 'LongDistanceRail'
    }

    if (this.ptMode.isDemandMode) {
      return 'OnDemand'
    }

    return 'Bus'
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
}
