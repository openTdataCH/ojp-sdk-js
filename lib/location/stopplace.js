export class StopPlace {
    constructor(stopPlaceRef, stopPlaceName, topographicPlaceRef, stopType = 'StopPlace') {
        this.stopPlaceRef = stopPlaceRef;
        this.stopPlaceName = stopPlaceName;
        this.topographicPlaceRef = topographicPlaceRef;
        this.stopType = stopType;
    }
    static initWithLocationTreeNode(locationTreeNode) {
        let stopType = 'StopPlace';
        let stopPlaceRef = locationTreeNode.findTextFromChildNamed('StopPlace/StopPlaceRef');
        let stopPlaceName = locationTreeNode.findTextFromChildNamed('StopPlace/StopPlaceName/Text');
        let topographicPlaceRef = locationTreeNode.findTextFromChildNamed('StopPlace/TopographicPlaceRef');
        // Try to build the StopPlace from StopPoint
        if (stopPlaceRef === null) {
            stopType = 'StopPoint';
            stopPlaceRef = locationTreeNode.findTextFromChildNamed('StopPoint/siri:StopPointRef');
            stopPlaceName = locationTreeNode.findTextFromChildNamed('StopPoint/StopPointName/Text');
            topographicPlaceRef = locationTreeNode.findTextFromChildNamed('StopPoint/TopographicPlaceRef');
        }
        // Otherwise try to see if we have a single siri:StopPointRef node
        if (stopPlaceRef === null) {
            stopType = 'StopPoint';
            stopPlaceRef = locationTreeNode.findTextFromChildNamed('siri:StopPointRef');
        }
        if (stopPlaceRef === null) {
            return null;
        }
        const stopPlace = new StopPlace(stopPlaceRef, stopPlaceName, topographicPlaceRef, stopType);
        return stopPlace;
    }
    static initWithServiceTreeNode(treeNode, pointType) {
        const stopPlaceRef = treeNode.findTextFromChildNamed(pointType + 'StopPointRef');
        const stopPlaceText = treeNode.findTextFromChildNamed(pointType + 'Text/Text');
        if (!(stopPlaceRef && stopPlaceText)) {
            return null;
        }
        const stopPlace = new StopPlace(stopPlaceRef, stopPlaceText, null, 'StopPlace');
        return stopPlace;
    }
}
