import { TripInfoResult } from "../../trip/trip-info/trip-info-result";
type TripInfoRequest_ParserMessage = 'TripInfoRequest.DONE' | 'ERROR';
export type TripInfoRequest_Response = {
    tripInfoResult: TripInfoResult | null;
    message: TripInfoRequest_ParserMessage | null;
};
export type TripInfoRequest_Callback = (response: TripInfoRequest_Response) => void;
export {};
