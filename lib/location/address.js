export class Address {
    constructor(addressCode) {
        this.addressCode = addressCode;
        this.addressName = null;
        this.topographicPlaceRef = null;
        this.topographicPlaceName = null;
        this.street = null;
        this.houseNumber = null;
        this.postCode = null;
    }
    static initWithLocationTreeNode(locationTreeNode) {
        const addressTreeNode = locationTreeNode.findChildNamed('Address');
        if (addressTreeNode === null) {
            return null;
        }
        const addressCode = addressTreeNode.findTextFromChildNamed('PublicCode');
        if (addressCode === null) {
            return null;
        }
        const address = new Address(addressCode);
        address.addressName = addressTreeNode.findTextFromChildNamed('Name/Text');
        address.topographicPlaceRef = addressTreeNode.findTextFromChildNamed('TopographicPlaceRef');
        address.topographicPlaceName = addressTreeNode.findTextFromChildNamed('TopographicPlaceName');
        address.street = addressTreeNode.findTextFromChildNamed('Street');
        address.houseNumber = addressTreeNode.findTextFromChildNamed('HouseNumber');
        address.postCode = addressTreeNode.findTextFromChildNamed('PostCode');
        return address;
    }
}
