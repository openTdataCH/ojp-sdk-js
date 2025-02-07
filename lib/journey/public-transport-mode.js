export class PublicTransportMode {
    constructor(ptMode, subMode, name, shortName) {
        this.ptMode = ptMode;
        this.subMode = subMode;
        this.name = name;
        this.shortName = shortName;
        this.isDemandMode = false;
    }
    static initWithServiceTreeNode(serviceTreeNode) {
        var _a, _b;
        const ptModeNode = serviceTreeNode.findChildNamed('Mode');
        if (ptModeNode === null) {
            return null;
        }
        const ptModeS = ptModeNode.findTextFromChildNamed('PtMode');
        if (ptModeS === null) {
            return null;
        }
        let subMode = null;
        const subModeNode = (_a = ptModeNode.children.find(el => el.name.toLowerCase().endsWith('submode'))) !== null && _a !== void 0 ? _a : null;
        if (subModeNode !== null) {
            subMode = {
                key: subModeNode.name.replace('siri:', ''),
                value: (_b = subModeNode.text) !== null && _b !== void 0 ? _b : 'subMode text n/a',
            };
        }
        const name = serviceTreeNode.findTextFromChildNamed('Mode/Name/Text');
        const shortName = serviceTreeNode.findTextFromChildNamed('Mode/ShortName/Text');
        const publicTransportMode = new PublicTransportMode(ptModeS, subMode, name, shortName);
        const busSubmode = serviceTreeNode.findTextFromChildNamed('Mode/siri:BusSubmode');
        // TODO - do we still need this?
        // publicTransportMode.isDemandMode = busSubmode !== null;
        publicTransportMode.isDemandMode = (busSubmode === 'demandAndResponseBus' || busSubmode === 'unknown');
        return publicTransportMode;
    }
    isRail() {
        return this.ptMode === 'rail';
    }
    hasPrecisePolyline() {
        if (this.isDemandMode) {
            return true;
        }
        const ignorePtModes = [
            'bus',
            'tram'
        ];
        if (ignorePtModes.indexOf(this.ptMode) !== -1) {
            return false;
        }
        return true;
    }
    addToXMLNode(parentNode) {
        const modeNode = parentNode.ele('ojp:Mode');
        modeNode.ele('ojp:PtMode', this.ptMode);
        if (this.name) {
            modeNode.ele('ojp:Name').ele('ojp:Text', this.name);
        }
        if (this.shortName) {
            modeNode.ele('ojp:ShortName').ele('ojp:Text', this.shortName);
        }
    }
}
