import { Location } from '../../location/location';
import { PathGuidance } from '../path-guidance';
import { LegTrack } from './leg-track';
import { TripLeg } from "./trip-leg";
import { Duration } from '../../shared/duration';
import { ServiceBooking } from './continous-leg/service-booking';
export class TripContinousLeg extends TripLeg {
    constructor(legType, legIDx, legDistance, fromLocation, toLocation) {
        super(legType, legIDx, fromLocation, toLocation);
        this.legTransportMode = null;
        this.legDistance = legDistance;
        this.pathGuidance = null;
        this.walkDuration = null;
        this.serviceBooking = null;
        this.transferMode = null;
    }
    static initWithTreeNode(legIDx, treeNode, legType) {
        var _a;
        const legStartPlaceRefTreeNode = treeNode.findChildNamed('LegStart');
        const legEndPlaceRefTreeNode = treeNode.findChildNamed('LegEnd');
        if (legStartPlaceRefTreeNode === null || legEndPlaceRefTreeNode === null) {
            return null;
        }
        const legStartPlaceRef = Location.initWithTreeNode(legStartPlaceRefTreeNode);
        const legEndPlaceRef = Location.initWithTreeNode(legEndPlaceRefTreeNode);
        if (legStartPlaceRef === null || legEndPlaceRef === null) {
            return null;
        }
        let distanceS = (_a = treeNode.findTextFromChildNamed('Length')) !== null && _a !== void 0 ? _a : '0';
        const legDistance = parseInt(distanceS);
        const tripLeg = new TripContinousLeg(legType, legIDx, legDistance, legStartPlaceRef, legEndPlaceRef);
        tripLeg.legDuration = Duration.initWithTreeNode(treeNode);
        tripLeg.pathGuidance = PathGuidance.initWithTreeNode(treeNode);
        tripLeg.legTransportMode = tripLeg.computeLegTransportModeFromTreeNode(treeNode, legType);
        tripLeg.transferMode = tripLeg.computeLegTransferModeFromTreeNode(treeNode);
        const isOthersDriveCar = tripLeg.legTransportMode === 'taxi' || tripLeg.legTransportMode === 'others-drive-car';
        if (isOthersDriveCar) {
            tripLeg.serviceBooking = ServiceBooking.initWithLegTreeNode(treeNode);
        }
        tripLeg.legTrack = LegTrack.initWithLegTreeNode(treeNode);
        if (legType === 'TransferLeg') {
            tripLeg.walkDuration = Duration.initWithTreeNode(treeNode, 'WalkDuration');
        }
        return tripLeg;
    }
    computeLegTransportModeFromTreeNode(treeNode, legType) {
        let legModeS = null;
        if (legType === 'TransferLeg') {
            return null;
        }
        if (legType === 'TimedLeg' || legType === 'ContinousLeg') {
            legModeS = treeNode.findTextFromChildNamed('Service/IndividualMode');
            if (legModeS === null) {
                const personalModeParts = [];
                const personalNodePaths = [
                    'Service/PersonalMode',
                    'Service/PersonalModeOfOperation',
                    'Service/Mode/PtMode',
                    'Service/Mode/siri:RailSubmode',
                    'Service/Mode/siri:WaterSubmode',
                ];
                personalNodePaths.forEach(personalNodePath => {
                    const personalNodeValue = treeNode.findTextFromChildNamed(personalNodePath);
                    if (personalNodeValue !== null) {
                        personalModeParts.push(personalNodeValue);
                    }
                });
                legModeS = personalModeParts.join('.');
            }
        }
        const firstBookingAgency = treeNode.findTextFromChildNamed('Service/BookingArrangements/BookingArrangement/BookingAgencyName/Text');
        const legMode = this.computeLegTransportModeFromString(legModeS, firstBookingAgency);
        if (legMode === null) {
            console.error('ERROR computeLegTransportModeFromString');
            console.log('=> CANT handle mode --' + legModeS + '--');
            console.log(treeNode);
        }
        return legMode;
    }
    computeLegTransferModeFromTreeNode(treeNode) {
        const transferModeS = treeNode.findTextFromChildNamed('TransferType');
        if (transferModeS === null) {
            return null;
        }
        if (transferModeS === 'walk') {
            return 'walk';
        }
        if (transferModeS === 'remainInVehicle') {
            return 'remainInVehicle';
        }
        console.error('CANT map TransferMode from ==' + transferModeS + '==');
        return null;
    }
    computeLegTransportModeFromString(legModeS, firstBookingAgency = null) {
        if (legModeS === null) {
            return null;
        }
        if (legModeS === 'walk') {
            return 'walk';
        }
        if (legModeS === 'self-drive-car') {
            return 'self-drive-car';
        }
        if (legModeS === 'cycle') {
            return 'cycle';
        }
        if (legModeS === 'taxi') {
            // HACK: BE returns 'taxi' for limo, check first booking agency to see if is actually a limo leg
            if ((firstBookingAgency === null || firstBookingAgency === void 0 ? void 0 : firstBookingAgency.indexOf('_limousine_')) !== -1) {
                return 'others-drive-car';
            }
            return 'taxi';
        }
        if (legModeS === 'car.own') {
            return 'self-drive-car';
        }
        if (legModeS === 'car.own.rail.vehicleTunnelTransportRailService') {
            return 'car-shuttle-train';
        }
        if (legModeS === 'car.own.water.localCarFerry') {
            return 'car-ferry';
        }
        if (legModeS === 'foot.own') {
            return 'walk';
        }
        return null;
    }
    isDriveCarLeg() {
        return this.legTransportMode === 'self-drive-car';
    }
    isSharedMobility() {
        if (this.legTransportMode === null) {
            return false;
        }
        const sharedMobilityModes = ['cycle', 'bicycle_rental', 'car_sharing', 'escooter_rental'];
        const hasSharedMobilityMode = sharedMobilityModes.indexOf(this.legTransportMode) !== -1;
        return hasSharedMobilityMode;
    }
    isWalking() {
        return this.legTransportMode === 'walk';
    }
    isTaxi() {
        return this.legTransportMode === 'taxi' || this.legTransportMode === 'others-drive-car';
    }
    formatDistance() {
        if (this.legDistance > 1000) {
            const distanceKmS = (this.legDistance / 1000).toFixed(1) + ' km';
            return distanceKmS;
        }
        return this.legDistance + ' m';
    }
    addToXMLNode(parentNode) {
        const tripLegNode = parentNode.ele('ojp:TripLeg');
        tripLegNode.ele('ojp:LegId', this.legID);
        tripLegNode.ele('ojp:' + this.legType);
    }
}
