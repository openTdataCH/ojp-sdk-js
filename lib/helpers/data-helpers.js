export class DataHelpers {
    static convertStopPointToStopPlace(stopPointRef) {
        if (!stopPointRef.includes(':sloid:')) {
            return stopPointRef;
        }
        // ch:1:sloid:92321:2:31
        const stopPointMatches = stopPointRef.match(/^([^:]+?):([^:]+?):sloid:([^:]+?):([^:]+?):([^:]+?)$/);
        if (stopPointMatches === null) {
            return stopPointRef;
        }
        const stopRef = stopPointMatches[3];
        const countryRef = stopPointMatches[1];
        if (countryRef === 'ch') {
            const stopPlaceRef = '85' + stopRef.padStart(5, '0').slice(-5);
            return stopPlaceRef;
        }
        console.log('convertStopPointToStopPlace: unhandled countryRef for ' + stopPointRef);
        console.log(stopPointMatches);
        return stopPointRef;
    }
}
