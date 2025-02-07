import { XMLElement } from 'xmlbuilder';
import { TreeNode } from '../xml/tree-node';
interface PublicTransportSubMode {
    key: string;
    value: string;
}
export declare class PublicTransportMode {
    ptMode: string;
    subMode: PublicTransportSubMode | null;
    name: string | null;
    shortName: string | null;
    isDemandMode: boolean;
    constructor(ptMode: string, subMode: PublicTransportSubMode | null, name: string | null, shortName: string | null);
    static initWithServiceTreeNode(serviceTreeNode: TreeNode): PublicTransportMode | null;
    isRail(): boolean;
    hasPrecisePolyline(): boolean;
    addToXMLNode(parentNode: XMLElement): void;
}
export {};
