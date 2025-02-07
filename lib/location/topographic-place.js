export class TopographicPlace {
    constructor(code, name) {
        this.code = code;
        this.name = name;
    }
    static initWithLocationTreeNode(locationTreeNode) {
        const code = locationTreeNode.findTextFromChildNamed('TopographicPlace/TopographicPlaceCode');
        const name = locationTreeNode.findTextFromChildNamed('TopographicPlace/TopographicPlaceName/Text');
        if (!(code && name)) {
            return null;
        }
        const topographicPlace = new TopographicPlace(code, name);
        return topographicPlace;
    }
}
