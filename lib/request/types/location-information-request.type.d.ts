import { Location } from "../../location/location";
type LIR_ParserMessage = "LocationInformation.DONE" | "ERROR";
export type LIR_Response = {
    locations: Location[];
    message: LIR_ParserMessage | null;
};
export type LIR_Callback = (response: LIR_Response) => void;
export {};
