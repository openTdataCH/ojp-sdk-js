export class PtSituationSource {
    constructor(sourceType) {
        this.sourceType = sourceType;
        this.countryRef = null;
        this.name = null;
        this.externalCode = null;
    }
    static initWithSituationTreeNode(treeNode) {
        const sourceType = treeNode.findTextFromChildNamed('siri:Source/siri:SourceType');
        if (sourceType === null) {
            console.log('ERROR - cant PtSituationSource.initFromSituationNode');
            console.log(treeNode);
            return null;
        }
        const situationSource = new PtSituationSource(sourceType);
        situationSource.countryRef = treeNode.findTextFromChildNamed('siri:Source/siri:CountryRef');
        situationSource.name = treeNode.findTextFromChildNamed('siri:Source/siri:Name');
        situationSource.externalCode = treeNode.findTextFromChildNamed('siri:Source/siri:ExternalCode');
        return situationSource;
    }
}
