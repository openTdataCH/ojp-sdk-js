export class StopPointTime {
    constructor(timetableTime, estimatedTime) {
        this.timetableTime = timetableTime;
        this.estimatedTime = estimatedTime;
        if (estimatedTime) {
            const dateDiffSeconds = (estimatedTime.getTime() - timetableTime.getTime()) / 1000;
            this.delayMinutes = Math.floor(dateDiffSeconds / 60);
        }
        else {
            this.delayMinutes = null;
        }
    }
    static initWithParentTreeNode(parentTreeNode, stopTimeType) {
        const stopTimeTreeNode = parentTreeNode.findChildNamed(stopTimeType);
        if (stopTimeTreeNode === null) {
            return null;
        }
        const stopTime = StopPointTime.initWithContextTreeNode(stopTimeTreeNode);
        return stopTime;
    }
    static initWithContextTreeNode(contextNode) {
        const timetableTimeS = contextNode.findTextFromChildNamed('TimetabledTime');
        if (timetableTimeS === null) {
            return null;
        }
        const timetableTime = new Date(Date.parse(timetableTimeS));
        let estimatedTime = null;
        const estimatedTimeS = contextNode.findTextFromChildNamed('EstimatedTime');
        if (estimatedTimeS) {
            estimatedTime = new Date(Date.parse(estimatedTimeS));
        }
        const stopPointTime = new StopPointTime(timetableTime, estimatedTime);
        return stopPointTime;
    }
}
