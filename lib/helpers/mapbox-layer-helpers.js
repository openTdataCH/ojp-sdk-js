import { MapLegTypeColor, MapLegTypes, MapLegLineTypeColor, MapTripLegLineTypes } from "../config/map-colors";
import { TripLegPropertiesEnum } from "../types/map-geometry-types";
export class MapboxLayerHelpers {
    static FilterBeelines() {
        const drawType = 'Beeline';
        return this.FilterByDrawType(drawType);
    }
    static FilterWalkingLegs() {
        const filterExpression = [
            "all",
            this.FilterByDrawType('LegLine'),
            this.FilterByLineType('Walk'),
        ];
        return filterExpression;
    }
    static FilterLegPoints() {
        return this.FilterByDrawType('LegPoint');
    }
    static ColorCaseByLegLineType() {
        const caseExpression = ["case"];
        MapTripLegLineTypes.forEach(lineType => {
            const caseOptionCondition = ["==", ["get", TripLegPropertiesEnum.LineType], lineType];
            caseExpression.push(caseOptionCondition);
            const colorCode = MapLegLineTypeColor[lineType];
            caseExpression.push(colorCode);
        });
        // Default is Pink
        caseExpression.push('#FF1493');
        return caseExpression;
    }
    static FilterByDrawType(drawType) {
        const filterExpression = [
            "==", ["get", TripLegPropertiesEnum.DrawType], drawType
        ];
        return filterExpression;
    }
    static FilterByPointType(pointType) {
        const filterExpression = [
            "==", ["get", TripLegPropertiesEnum.PointType], pointType
        ];
        return filterExpression;
    }
    static FilterByLineType(lineType) {
        const filterExpression = [
            "==", ["get", TripLegPropertiesEnum.LineType], lineType
        ];
        return filterExpression;
    }
    static FilterTimedLegTracks() {
        const filterExpression = [
            "all",
            // TODO - exclude Walk
            this.FilterByDrawType('LegLine'),
        ];
        return filterExpression;
    }
    static ColorCaseByLegType() {
        const caseExpression = ["case"];
        MapLegTypes.forEach(legType => {
            const caseOptionCondition = ["==", ["get", TripLegPropertiesEnum.LegType], legType];
            caseExpression.push(caseOptionCondition);
            const colorCode = MapLegTypeColor[legType];
            caseExpression.push(colorCode);
        });
        // Default is Pink
        caseExpression.push('#FF1493');
        return caseExpression;
    }
}
