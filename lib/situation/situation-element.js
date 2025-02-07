import { PtSituationSource } from './situation-source';
export class PtSituationElement {
    constructor(situationNumber, creationTime, countryRef, participantRef, version, source, progress, validityPeriods, alertCause, priority, scopeType, publishingActions, isPlanned) {
        this.situationNumber = situationNumber;
        this.creationTime = creationTime;
        this.countryRef = countryRef;
        this.participantRef = participantRef;
        this.version = version;
        this.source = source;
        this.progress = progress;
        this.validityPeriods = validityPeriods;
        this.alertCause = alertCause;
        this.priority = priority;
        this.scopeType = scopeType;
        this.publishingActions = publishingActions;
        this.isPlanned = isPlanned;
        this.situationContent = null;
        this.treeNode = null;
    }
    static initWithSituationTreeNode(treeNode) {
        var _a, _b, _c, _d;
        const situationNumber = treeNode.findTextFromChildNamed('siri:SituationNumber');
        const creationTimeS = treeNode.findTextFromChildNamed('siri:CreationTime');
        if (creationTimeS === null) {
            console.error('ERROR - creationTimeS is null', 'PtSituationElement.initFromSituationNode');
            console.log(treeNode);
            return null;
        }
        const creationTime = new Date(creationTimeS);
        const countryRef = (_a = treeNode.findTextFromChildNamed('siri:CountryRef')) !== null && _a !== void 0 ? _a : 'n/a CountryRef';
        const participantRef = (_b = treeNode.findTextFromChildNamed('siri:ParticipantRef')) !== null && _b !== void 0 ? _b : 'n/a ParticipantRef';
        const versionS = treeNode.findTextFromChildNamed('siri:Version');
        if (versionS === null) {
            console.error('ERROR - Version is NULL', 'PtSituationElement.initFromSituationNode');
            console.log(treeNode);
            return null;
        }
        const version = parseInt(versionS);
        const situationSource = PtSituationSource.initWithSituationTreeNode(treeNode);
        const situationProgress = (_c = treeNode.findTextFromChildNamed('siri:Progress')) !== null && _c !== void 0 ? _c : 'n/a Progress';
        const validityPeriods = [];
        const validityPeriodNodes = treeNode.findChildrenNamed('siri:ValidityPeriod');
        validityPeriodNodes.forEach(validityPeriodNode => {
            const validityPeriodStartDateS = validityPeriodNode.findTextFromChildNamed('siri:StartTime');
            const validityPeriodEndDateS = validityPeriodNode.findTextFromChildNamed('siri:EndTime');
            if (!(validityPeriodStartDateS && validityPeriodEndDateS)) {
                return;
            }
            const validityPeriod = {
                startDate: new Date(validityPeriodStartDateS),
                endDate: new Date(validityPeriodEndDateS)
            };
            validityPeriods.push(validityPeriod);
        });
        if (validityPeriods.length === 0) {
            console.error('initFromSituationNode: EMPTY <ValidityPeriod>');
            console.log(situationNumber);
            console.log(treeNode);
            return null;
        }
        const alertCause = (_d = treeNode.findTextFromChildNamed('siri:AlertCause')) !== null && _d !== void 0 ? _d : 'n/a AlertCause';
        const situationPriorityS = treeNode.findTextFromChildNamed('siri:Priority');
        if (situationPriorityS === null) {
            console.error('ERROR - Priority is NULL', 'PtSituationElement.initFromSituationNode');
            console.log(treeNode);
            return null;
        }
        const situationPriority = parseInt(situationPriorityS);
        const scopeType = (() => {
            const scopeTypeS = treeNode.findTextFromChildNamed('siri:ScopeType');
            if (scopeTypeS === 'line' || scopeTypeS === 'route') {
                return 'line';
            }
            ;
            if (scopeTypeS === 'stopPlace' || scopeTypeS === 'stopPoint') {
                return 'stopPlace';
            }
            ;
            if (scopeTypeS === 'vehicleJourney') {
                return 'vehicleJourney';
            }
            ;
            return 'unknown';
        })();
        if (!(situationNumber && situationSource)) {
            console.error('ERROR - cant init', 'PtSituationElement.initFromSituationNode');
            console.log(treeNode);
            return null;
        }
        const plannedS = treeNode.findTextFromChildNamed('siri:Planned');
        const isPlanned = plannedS === 'true';
        const publishingActions = PtSituationElement.computePublishingActionsFromSituationNode(situationNumber, scopeType, treeNode);
        const situationElement = new PtSituationElement(situationNumber, creationTime, countryRef, participantRef, version, situationSource, situationProgress, validityPeriods, alertCause, situationPriority, scopeType, publishingActions, isPlanned);
        situationElement.treeNode = treeNode;
        situationElement.situationContent = this.computeSituationContent(treeNode);
        if ((situationElement.publishingActions.length === 0) && (situationElement.situationContent === null)) {
            console.error('PtSituationElement.initFromSituationNode: NO publishing action found and also situationContent is null');
        }
        return situationElement;
    }
    static computePublishingActionsFromSituationNode(situationNumber, scopeType, treeNode) {
        const publishingActions = [];
        const publishingActionsNode = treeNode.findChildNamed('siri:PublishingActions');
        if (publishingActionsNode === null) {
            return publishingActions;
        }
        const publishingActionNodes = publishingActionsNode.findChildrenNamed('siri:PublishingAction');
        publishingActionNodes.forEach(publishingActionNode => {
            const publishingAction = PtSituationElement.computePublishingAction(situationNumber, scopeType, publishingActionNode);
            if (publishingAction === null) {
                console.error('ERROR - cant compute PublishingAction', 'PtSituationElement.initFromSituationNode');
                console.log(publishingActionNode);
                return;
            }
            publishingActions.push(publishingAction);
        });
        return publishingActions;
    }
    static computePublishingAction(situationNumber, scopeType, publishingActionTreeNode) {
        const infoActionNode = publishingActionTreeNode.findChildNamed('siri:PassengerInformationAction');
        if (infoActionNode === null) {
            console.error('computePublishingAction: NO <PassengerInformationAction>');
            console.log(situationNumber);
            console.log(publishingActionTreeNode);
            return null;
        }
        const actionRef = infoActionNode.findTextFromChildNamed('siri:ActionRef');
        const ownerRef = infoActionNode.findTextFromChildNamed('siri:OwnerRef');
        const perspectives = [];
        const perspectiveNodes = infoActionNode.findChildrenNamed('siri:Perspective');
        perspectiveNodes.forEach(perspectiveNode => {
            const perspectiveText = perspectiveNode.text;
            if (perspectiveText) {
                perspectives.push(perspectiveText);
            }
        });
        const textualContentTreeNode = publishingActionTreeNode.findChildNamed('siri:PassengerInformationAction/siri:TextualContent');
        let mapTextualContent = {};
        if (textualContentTreeNode) {
            mapTextualContent = {};
            textualContentTreeNode.children.forEach(childTreeNode => {
                const textKey = childTreeNode.name.replace('siri:', '').replace('Content', '');
                if (!(textKey in mapTextualContent)) {
                    mapTextualContent[textKey] = [];
                }
                if (childTreeNode.children.length > 0) {
                    const textValue = childTreeNode.children[0].text;
                    if (textValue !== null) {
                        mapTextualContent[textKey].push(textValue.trim());
                    }
                }
            });
        }
        const actionAffects = PtSituationElement.computeAffects(situationNumber, scopeType, publishingActionTreeNode);
        const publishingAction = {
            affects: actionAffects,
            passengerInformation: {
                actionRef: actionRef,
                ownerRef: ownerRef,
                perspectives: perspectives,
                mapTextualContent: mapTextualContent,
            },
        };
        return publishingAction;
    }
    static computeAffects(situationNumber, scopeType, publishingActionNode) {
        const actionAffects = [];
        const affectedNetworkTreeNode = publishingActionNode.findChildNamed('siri:PublishAtScope/siri:Affects/siri:Networks/siri:AffectedNetwork');
        if (affectedNetworkTreeNode) {
            const affectedLineNetworkNodes = affectedNetworkTreeNode.findChildrenNamed('siri:AffectedLine');
            affectedLineNetworkNodes.forEach(affectedLineNetworkNode => {
                var _a;
                const lineNetwork = PtSituationElement.computeLineNetwork(affectedLineNetworkNode);
                if (lineNetwork === null) {
                    return;
                }
                if (scopeType === 'line') {
                    actionAffects.push({
                        type: 'entire-line',
                        affect: lineNetwork
                    });
                }
                if (scopeType === 'stopPlace') {
                    const directionRef = (_a = affectedLineNetworkNode.findTextFromChildNamed('siri:Direction/siri:DirectionRef')) !== null && _a !== void 0 ? _a : 'n/a';
                    const stopPlacesNodes = affectedLineNetworkNode.findChildrenNamed('siri:StopPlaces/siri:AffectedStopPlace');
                    const stopPlaces = PtSituationElement.computeAffectedStopPlaces(stopPlacesNodes);
                    const affectedPartialLine = {
                        lineNetwork: lineNetwork,
                        directionRef: directionRef,
                        stopPlaces: stopPlaces,
                    };
                    actionAffects.push({
                        type: 'partial-line',
                        affect: affectedPartialLine
                    });
                }
            });
        }
        if (scopeType === 'stopPlace') {
            const stopPlacesTreeNode = publishingActionNode.findChildNamed('siri:PublishAtScope/siri:Affects/siri:StopPlaces');
            if (stopPlacesTreeNode) {
                const affectedStopPlaceNodes = stopPlacesTreeNode.findChildrenNamed('siri:AffectedStopPlace');
                const stopPlaces = PtSituationElement.computeAffectedStopPlaces(affectedStopPlaceNodes);
                stopPlaces.forEach(stopPlace => {
                    actionAffects.push({
                        type: 'stop',
                        affect: stopPlace
                    });
                });
            }
        }
        if (scopeType === 'vehicleJourney') {
            const affectedVehicleJourneys = PtSituationElement.computeAffectedJourneys(situationNumber, publishingActionNode);
            affectedVehicleJourneys.forEach(affectedVehicleJourney => {
                actionAffects.push({
                    type: 'vehicle-journey',
                    affect: affectedVehicleJourney
                });
            });
        }
        return actionAffects;
    }
    static computeLineNetwork(lineNetworkNode) {
        const operatorRef = lineNetworkNode.findTextFromChildNamed('siri:AffectedOperator/siri:OperatorRef');
        const lineRef = lineNetworkNode.findTextFromChildNamed('siri:LineRef');
        const publishedLineName = lineNetworkNode.findTextFromChildNamed('siri:PublishedLineName');
        if ((operatorRef === null) || (lineRef === null) || (publishedLineName === null)) {
            console.log('ERROR: LineNetwork cant init');
            console.log(lineNetworkNode);
            return null;
        }
        const stopPlaceNodes = lineNetworkNode.findChildrenNamed('siri:StopPlaces/siri:AffectedStopPlace');
        const stopPlaces = PtSituationElement.computeAffectedStopPlaces(stopPlaceNodes);
        const lineNetwork = {
            operator: {
                operatorRef: operatorRef
            },
            lineRef: lineRef,
            publishedLineName: publishedLineName,
            stopPlaces: stopPlaces
        };
        return lineNetwork;
    }
    static computeAffectedStopPlaces(stopPlaceNodes) {
        const stopPlaces = [];
        stopPlaceNodes.forEach(stopPlaceNode => {
            const stopPlaceRef = stopPlaceNode.findTextFromChildNamed('siri:StopPlaceRef');
            const placeName = stopPlaceNode.findTextFromChildNamed('siri:PlaceName');
            if ((stopPlaceRef === null) || (placeName === null)) {
                console.log('ERROR: StopPlace cant init');
                console.log(stopPlaceNode);
                return null;
            }
            const stopPlace = {
                stopPlaceRef: stopPlaceRef,
                placeName: placeName,
            };
            stopPlaces.push(stopPlace);
        });
        return stopPlaces;
    }
    static computeAffectedJourneys(situationNumber, publishingActionNode) {
        const affectedVehicleJourneys = [];
        const affectedVehicleJourneyNodes = publishingActionNode.findChildrenNamed('siri:PublishAtScope/siri:Affects/siri:VehicleJourneys/siri:AffectedVehicleJourney');
        affectedVehicleJourneyNodes.forEach((vehicleJourneyNode, idx) => {
            const framedVehicleJourneyRefNode = vehicleJourneyNode.findChildNamed('siri:FramedVehicleJourneyRef');
            if (framedVehicleJourneyRefNode === null) {
                console.error('computeAffectedJourneys - NULL FramedVehicleJourneyRef');
                console.log(situationNumber);
                console.log(vehicleJourneyNode);
                return;
            }
            const dataFrameRef = framedVehicleJourneyRefNode.findTextFromChildNamed('siri:DataFrameRef');
            const datedVehicleJourneyRef = framedVehicleJourneyRefNode.findTextFromChildNamed('siri:DatedVehicleJourneyRef');
            if (dataFrameRef === null || datedVehicleJourneyRef === null) {
                console.error('computeAffectedJourneys - NULL FramedVehicleJourneyRef members');
                console.log(situationNumber);
                console.log(framedVehicleJourneyRefNode);
                return;
            }
            const framedVehicleJourneyRef = {
                dataFrameRef: dataFrameRef,
                datedVehicleJourneyRef: datedVehicleJourneyRef,
            };
            const operatorRef = vehicleJourneyNode.findTextFromChildNamed('siri:Operator/siri:OperatorRef');
            if (operatorRef === null) {
                console.error('computeAffectedJourneys - NULL operatorRef');
                console.log(situationNumber);
                console.log(vehicleJourneyNode);
                return;
            }
            let origin = null;
            const orginRef = vehicleJourneyNode.findTextFromChildNamed('siri:Origins/siri:StopPlaceRef');
            if (orginRef !== null) {
                origin = {
                    stopPlaceRef: orginRef,
                    placeName: vehicleJourneyNode.findTextFromChildNamed('siri:Origins/siri:PlaceName')
                };
            }
            let destination = null;
            const destinationRef = vehicleJourneyNode.findTextFromChildNamed('siri:Destinations/siri:StopPlaceRef');
            if (destinationRef !== null) {
                destination = {
                    stopPlaceRef: destinationRef,
                    placeName: vehicleJourneyNode.findTextFromChildNamed('siri:Destinations/siri:PlaceName')
                };
            }
            const stopCallNodes = vehicleJourneyNode.findChildrenNamed('siri:Calls/siri:Call');
            const callStopsRef = [];
            stopCallNodes.forEach(stopCallNode => {
                const stopPlaceRef = stopCallNode.findTextFromChildNamed('siri:StopPlaceRef');
                if (stopPlaceRef === null) {
                    return;
                }
                callStopsRef.push(stopPlaceRef);
            });
            const lineRef = vehicleJourneyNode.findTextFromChildNamed('siri:LineRef');
            const publishedLineName = vehicleJourneyNode.findTextFromChildNamed('siri:PublishedLineName');
            const affectedVehicleJourney = {
                framedVehicleJourneyRef: framedVehicleJourneyRef,
                operator: {
                    operatorRef: operatorRef
                },
                origin: origin,
                destination: destination,
                callStopsRef: callStopsRef,
                lineRef: lineRef,
                publishedLineName: publishedLineName,
            };
            affectedVehicleJourneys.push(affectedVehicleJourney);
        });
        return affectedVehicleJourneys;
    }
    isActive(date = new Date()) {
        var _a;
        const activePeriod = (_a = this.validityPeriods.find(el => {
            return (el.startDate < date) && (el.endDate > date);
        })) !== null && _a !== void 0 ? _a : null;
        return activePeriod !== null;
    }
    static computeSituationContent(treeNode) {
        const summary = treeNode.findTextFromChildNamed('siri:Summary');
        if (summary === null) {
            return null;
        }
        const descriptions = [];
        const descriptionNodes = treeNode.findChildrenNamed('siri:Description');
        descriptionNodes.forEach(descriptionTreeNode => {
            const descriptionText = descriptionTreeNode.text;
            if (descriptionText) {
                descriptions.push(descriptionText);
            }
        });
        const details = [];
        const detailNodes = treeNode.findChildrenNamed('siri:Detail');
        detailNodes.forEach(detailTreeNode => {
            const detailText = detailTreeNode.text;
            if (detailText) {
                details.push(detailText);
            }
        });
        const situationContent = {
            summary: summary,
            descriptions: descriptions,
            details: details
        };
        return situationContent;
    }
}
