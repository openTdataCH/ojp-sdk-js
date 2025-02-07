export class TreeNode {
    constructor(name, parentName, attributes, children, text) {
        this.name = name;
        this.parentName = parentName;
        this.attributes = attributes;
        this.children = children;
        this.text = text;
    }
    findTextFromChildNamed(expr) {
        var _a;
        const exprParts = expr.split("/");
        let contextNode = this;
        exprParts.forEach((nodeName, idx) => {
            if (contextNode) {
                const newContextNode = contextNode.findChildNamed(nodeName);
                contextNode = newContextNode;
            }
        });
        const contextNodeText = (_a = contextNode === null || contextNode === void 0 ? void 0 : contextNode.text) !== null && _a !== void 0 ? _a : null;
        return contextNodeText;
    }
    findChildNamed(expr) {
        const exprParts = expr.split("/");
        let contextNode = this;
        exprParts.forEach((nodeName, idx) => {
            var _a;
            const newContextNode = (_a = contextNode === null || contextNode === void 0 ? void 0 : contextNode.children.find((el) => {
                return el.name === nodeName;
            })) !== null && _a !== void 0 ? _a : null;
            contextNode = newContextNode;
        });
        return contextNode;
    }
    findChildrenNamed(name) {
        if (name.includes("/")) {
            console.error("ERROR - do you want to use more than one level for findChildrenNamed? Use findTextFromChildNamed.");
            console.log(name);
            debugger;
        }
        const foundTreeNodes = [];
        this.children.forEach((el) => {
            if (el.name === name) {
                foundTreeNodes.push(el);
            }
        });
        return foundTreeNodes;
    }
    computeText() {
        const textParts = [];
        if (this.text === null) {
            if (this.children.length === 0) {
                return null;
            }
            this.children.forEach((child) => {
                const childText = child.computeText();
                if (childText) {
                    textParts.push(childText);
                }
            });
        }
        else {
            textParts.push(this.text);
        }
        return textParts.join(' ');
    }
}
