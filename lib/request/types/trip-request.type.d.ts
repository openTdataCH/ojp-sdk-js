import { Trip } from "../../trip";
export type TripRequest_ParserMessage = 'TripRequest.TripsNo' | 'TripRequest.Trip' | 'TripRequest.DONE' | 'ERROR';
export type TripRequest_Response = {
    tripsNo: number;
    trips: Trip[];
    message: TripRequest_ParserMessage | null;
};
export type TripRequest_Callback = (response: TripRequest_Response) => void;
