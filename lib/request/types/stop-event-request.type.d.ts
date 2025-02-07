import { StopEvent } from "../../stop-event/stop-event";
type StopEventRequest_ParserMessage = 'StopEvent.DONE' | 'ERROR';
export type StopEventRequest_Response = {
    stopEvents: StopEvent[];
    message: StopEventRequest_ParserMessage | null;
};
export type StopEventRequest_Callback = (response: StopEventRequest_Response) => void;
export {};
