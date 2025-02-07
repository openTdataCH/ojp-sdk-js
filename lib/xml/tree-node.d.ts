import * as sax from 'sax';
export declare class TreeNode {
    name: string;
    parentName: string | null;
    attributes: {
        [key: string]: sax.QualifiedAttribute;
    };
    children: TreeNode[];
    text: string | null;
    constructor(name: string, parentName: string | null, attributes: {
        [key: string]: sax.QualifiedAttribute;
    }, children: TreeNode[], text: string | null);
    findTextFromChildNamed(expr: string): string | null;
    findChildNamed(expr: string): TreeNode | null;
    findChildrenNamed(name: string): TreeNode[];
    computeText(): string | null;
}
