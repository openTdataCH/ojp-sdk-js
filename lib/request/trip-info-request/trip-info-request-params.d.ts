import { Language } from '../../types/language-type';
import { BaseRequestParams } from '../base-request-params';
export declare class TripInfoRequestParams extends BaseRequestParams {
    journeyRef: string;
    operatingDayRef: string;
    constructor(language: Language, journeyRef: string, operatingDayRef: string);
    static Empty(): TripInfoRequestParams;
    protected buildRequestNode(): void;
}
