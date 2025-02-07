import { Trip } from "../../trip";
export declare class TripRequestResponse {
    trips: Trip[];
    constructor(trips: Trip[]);
    asXML(): string;
}
