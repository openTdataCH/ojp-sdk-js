export type RequestError = 'FetchError' | 'ParseTripsXMLError' | 'ParseXMLError';
export interface RequestErrorData {
    error: RequestError;
    message: string;
}
export interface RequestInfo {
    requestDateTime: Date | null;
    requestXML: string | null;
    responseDateTime: Date | null;
    responseXML: string | null;
    parseDateTime: Date | null;
    error: RequestErrorData | null;
}
