export class Duration {
    constructor(hours, minutes) {
        this.hours = hours;
        this.minutes = minutes;
        this.totalMinutes = hours * 60 + minutes;
    }
    static initWithTreeNode(parentTreeNode, nodeName = 'Duration') {
        const durationS = parentTreeNode.findTextFromChildNamed(nodeName);
        if (durationS === null) {
            return null;
        }
        const duration = Duration.initFromDurationText(durationS);
        return duration;
    }
    static initFromDurationText(durationS) {
        if (durationS === null) {
            return null;
        }
        // PT4H19M
        durationS = durationS.replace('PT', '');
        let hours = 0;
        const hoursMatches = durationS.match(/([0-9]+?)H/);
        if (hoursMatches) {
            hours = parseInt(hoursMatches[1]);
        }
        let minutes = 0;
        const minutesMatches = durationS.match(/([0-9]+?)M/);
        if (minutesMatches) {
            minutes = parseInt(minutesMatches[1]);
        }
        const duration = new Duration(hours, minutes);
        return duration;
    }
    static initFromTotalMinutes(totalMinutes) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes - hours * 60;
        const duration = new Duration(hours, minutes);
        return duration;
    }
    formatDuration() {
        const durationParts = [];
        if (this.hours > 0) {
            durationParts.push(this.hours + 'h ');
        }
        durationParts.push(this.minutes + 'min');
        return durationParts.join('');
    }
    plus(otherDuration) {
        return Duration.initFromTotalMinutes(this.totalMinutes + otherDuration.totalMinutes);
    }
    asOJPFormattedText() {
        const parts = [];
        parts.push('PT');
        parts.push('' + this.hours + 'H');
        parts.push('' + this.minutes + 'M');
        return parts.join('');
    }
}
