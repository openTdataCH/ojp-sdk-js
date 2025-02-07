const mapPoiSubCategoryIcons = {
    service: ['atm', 'hairdresser'],
    shopping: ['all', 'clothes', 'optician'],
    catering: ['all'],
    accommodation: ['all'],
};
export class PointOfInterest {
    constructor(code, name, category, subCategory, categoryTags) {
        this.code = code;
        this.name = name;
        this.category = category;
        this.subCategory = subCategory;
        this.categoryTags = categoryTags;
    }
    static initWithLocationTreeNode(locationTreeNode) {
        const treeNode = locationTreeNode.findChildNamed('PointOfInterest');
        if (treeNode === null) {
            return null;
        }
        const code = treeNode.findTextFromChildNamed('PointOfInterestCode');
        const name = treeNode.findTextFromChildNamed('PointOfInterestName/Text');
        if (!(code && name)) {
            return null;
        }
        const categoryTags = [];
        let category = null;
        let subCategory = null;
        const categoryTreeNodes = treeNode.findChildrenNamed('PointOfInterestCategory');
        categoryTreeNodes.forEach(categoryTreeNode => {
            const tagValue = categoryTreeNode.findTextFromChildNamed('OsmTag/Value');
            if (tagValue) {
                categoryTags.push(tagValue);
            }
            const tagKey = categoryTreeNode.findTextFromChildNamed('OsmTag/Tag');
            if (tagKey === 'POI_0' || tagKey === 'amenity') {
                category = tagValue;
            }
            if (tagKey === 'POI_1') {
                subCategory = tagValue;
            }
        });
        if (category === null) {
            console.error('PointOfInterest.initWithLocationTreeNode error - no category');
            category = 'none';
        }
        const poi = new PointOfInterest(code, name, category, subCategory, categoryTags);
        return poi;
    }
    // The return is a 50px image in ./src/assets/map-style-icons
    // i.e. ./src/assets/map-style-icons/poi-atm.png
    // icons from https://www.shareicon.net/author/adiante-apps
    computePoiMapIcon() {
        const fallbackIcon = 'poi-unknown';
        if (!(this.category in mapPoiSubCategoryIcons)) {
            return fallbackIcon;
        }
        const hasSubCategory = this.subCategory && (mapPoiSubCategoryIcons[this.category].indexOf(this.subCategory) > -1);
        if (hasSubCategory) {
            const mapIcon = 'poi-' + this.category + '-' + this.subCategory;
            return mapIcon;
        }
        const hasAllSubCategory = mapPoiSubCategoryIcons[this.category].indexOf('all') > -1;
        if (hasAllSubCategory) {
            const mapIcon = 'poi-' + this.category + '-all';
            return mapIcon;
        }
        return fallbackIcon;
    }
}
