import { Location } from "../../../location/location"
import { StopPointTime } from "./stop-point-time"
import { StopPointType } from "../../../types/stop-point-type"
import { PtSituationElement } from "../../../situation/situation-element"
import { TreeNode } from "../../../xml/tree-node"
import { StopPlace } from "../../../location/stopplace"
import { DEBUG_LEVEL } from "../../../constants"


type VehicleAccessType = 
  'PLATFORM_ACCESS_WITHOUT_ASSISTANCE' | 'PLATFORM_ACCESS_WITH_ASSISTANCE' | 'PLATFORM_ACCESS_WITH_ASSISTANCE_WHEN_NOTIFIED' 
  | 'PLATFORM_NOT_WHEELCHAIR_ACCESSIBLE' | 'ALTERNATIVE_TRANSPORT' | 'NO_DATA';

export class StopPoint {
  public stopPointType: StopPointType
  
  public location: Location
  public arrivalData: StopPointTime | null
  public departureData: StopPointTime | null
  public plannedPlatform: string | null
  public actualPlatform: string | null
  public sequenceOrder: number | null
  public isNotServicedStop: boolean | null

  public siriSituationIds: string[]
  public siriSituations: PtSituationElement[]

  public vehicleAccessType: VehicleAccessType | null

  constructor(
    stopPointType: StopPointType, 
    location: Location, arrivalData: StopPointTime | null, 
    departureData: StopPointTime | null, 
    plannedPlatform: string | null, 
    sequenceOrder: number | null
  ) {
    this.stopPointType = stopPointType 
    this.location = location
    this.arrivalData = arrivalData
    this.departureData = departureData
    this.plannedPlatform = plannedPlatform
    this.actualPlatform = null
    this.sequenceOrder = sequenceOrder
    this.isNotServicedStop = null;

    this.siriSituationIds = [];
    this.siriSituations = [];

    this.vehicleAccessType = null;
  }

  public static initWithTreeNode(treeNode: TreeNode, stopPointType: StopPointType): StopPoint | null {
    const stopPointRef = treeNode.findTextFromChildNamed('siri:StopPointRef');
    const stopPointName = treeNode.findTextFromChildNamed('StopPointName/Text');
    if (!(stopPointRef && stopPointName)) {
      return null;
    }

    const location = new Location();
    location.stopPlace = new StopPlace(stopPointRef, stopPointName, null);

    const arrivalData = StopPointTime.initWithParentTreeNode(treeNode, 'ServiceArrival');
    const departureData = StopPointTime.initWithParentTreeNode(treeNode, 'ServiceDeparture');
    const plannedPlatform = treeNode.findTextFromChildNamed('PlannedQuay/Text');

    const sequenceOrderS = treeNode.findTextFromChildNamed('Order');
    const sequenceOrder = sequenceOrderS === null ? null : parseInt(sequenceOrderS, 10);

    const stopPoint = new StopPoint(stopPointType, location, arrivalData, departureData, plannedPlatform, sequenceOrder);
    
    stopPoint.actualPlatform = treeNode.findTextFromChildNamed('EstimatedQuay/Text');

    const notServicedStopNode = treeNode.findChildNamed('NotServicedStop');
    if (notServicedStopNode) {
      stopPoint.isNotServicedStop = notServicedStopNode.text === 'true';
    }

    stopPoint.siriSituationIds = [];
    const situationFullRefTreeNodes = treeNode.findChildrenNamed('SituationFullRef');
    situationFullRefTreeNodes.forEach(situationFullRefTreeNode => {
      const situationNumber = situationFullRefTreeNode.findTextFromChildNamed('SituationNumber');
      if (situationNumber) {
        stopPoint.siriSituationIds.push(situationNumber);
      }
    });

    stopPoint.vehicleAccessType = StopPoint.computePlatformAssistance(treeNode);

    return stopPoint;
  }

  private static computePlatformAssistance(treeNode: TreeNode): VehicleAccessType | null {
    const platformText = treeNode.findTextFromChildNamed('NameSuffix/Text');
    if (platformText === null) {
      return null;
    }

    if (platformText === 'PLATFORM_ACCESS_WITH_ASSISTANCE') {
      return 'PLATFORM_ACCESS_WITH_ASSISTANCE';
    }

    if (platformText === 'PLATFORM_ACCESS_WITH_ASSISTANCE_WHEN_NOTIFIED') {
      return 'PLATFORM_ACCESS_WITH_ASSISTANCE_WHEN_NOTIFIED';
    }

    if (platformText === 'PLATFORM_NOT_WHEELCHAIR_ACCESSIBLE') {
      return 'PLATFORM_NOT_WHEELCHAIR_ACCESSIBLE';
    }

    if (platformText === 'PLATFORM_ACCESS_WITHOUT_ASSISTANCE') {
      return 'PLATFORM_ACCESS_WITHOUT_ASSISTANCE';
    }

    if (platformText === 'NO_DATA') {
      return 'NO_DATA';
    }

    if (platformText === 'ALTERNATIVE_TRANSPORT') {
      return 'ALTERNATIVE_TRANSPORT';
    }

    if (DEBUG_LEVEL === 'DEBUG') {
      console.log('StopPoint.computePlatformAssistance - cant compute platform from text:--' + platformText + '--');
    }

    return null;
  }
}
