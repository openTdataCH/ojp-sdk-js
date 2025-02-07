import { Duration } from "../shared/duration";
export type DistanceSource = 'trip' | 'legs-sum';
export interface TripStats {
    duration: Duration;
    distanceMeters: number;
    distanceSource: DistanceSource;
    transferNo: number;
    startDatetime: Date;
    endDatetime: Date;
    isCancelled: boolean | null;
    isInfeasable: boolean | null;
    isUnplanned: boolean | null;
}
