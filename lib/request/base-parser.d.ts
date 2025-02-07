import { TreeNode } from "../xml/tree-node";
export declare class BaseParser {
    protected rootNode: TreeNode;
    protected currentNode: TreeNode;
    protected stack: TreeNode[];
    private mapUriNS;
    constructor();
    private resetNodes;
    parseXML(responseXMLText: string): void;
    private _parseXML;
    private onOpenTag;
    private onText;
    private onSaxCloseTag;
    protected onCloseTag(nodeName: string): void;
    protected onError(saxError: any): void;
    protected onEnd(): void;
}
