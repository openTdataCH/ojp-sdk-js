import fetch from 'cross-fetch';
export class OJPBaseRequest {
    constructor(stageConfig) {
        this.stageConfig = stageConfig;
        this.requestInfo = {
            requestDateTime: null,
            requestXML: null,
            responseDateTime: null,
            responseXML: null,
            parseDateTime: null,
            error: null
        };
        this.logRequests = false;
        this.mockRequestXML = null;
        this.mockResponseXML = null;
    }
    buildRequestXML() {
        // override
        return '<override/>';
    }
    fetchOJPResponse() {
        this.requestInfo.requestDateTime = new Date();
        if (this.mockRequestXML) {
            this.requestInfo.requestXML = this.mockRequestXML;
        }
        else {
            this.requestInfo.requestXML = this.buildRequestXML();
        }
        const apiEndpoint = this.stageConfig.url;
        if (this.logRequests) {
            console.log('OJP Request: /POST - ' + apiEndpoint);
            console.log(this.requestInfo.requestXML);
        }
        const requestHeaders = {
            "Content-Type": "text/xml"
        };
        if (this.stageConfig.authToken) {
            requestHeaders['Authorization'] = 'Bearer ' + this.stageConfig.authToken;
        }
        const requestOptions = {
            method: 'POST',
            body: this.requestInfo.requestXML,
            headers: requestHeaders,
        };
        const responsePromise = new Promise((resolve) => {
            if (this.mockResponseXML) {
                this.requestInfo.responseXML = this.mockResponseXML;
                this.requestInfo.responseDateTime = new Date();
                resolve(this.requestInfo);
                return;
            }
            fetch(apiEndpoint, requestOptions).then(response => {
                if (!response.ok) {
                    this.requestInfo.error = {
                        error: 'FetchError',
                        message: 'HTTP ERROR - Status:' + response.status + ' - URL:' + apiEndpoint,
                    };
                    return null;
                }
                return response.text();
            }).then(responseText => {
                if (responseText !== null) {
                    this.requestInfo.responseXML = responseText;
                    this.requestInfo.responseDateTime = new Date();
                }
                resolve(this.requestInfo);
            }).catch(error => {
                this.requestInfo.error = {
                    error: 'FetchError',
                    message: error,
                };
                resolve(this.requestInfo);
            });
        });
        return responsePromise;
    }
}
