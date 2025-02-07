type DEBUG_LEVEL_Type = 'DEBUG' | 'PROD';
export const DEBUG_LEVEL: DEBUG_LEVEL_Type = (() => {
    const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
    if (!isBrowser) {
        return 'PROD';
    }

    if (window.location.hostname.includes('github.io')) {
        return 'PROD';
    }

    return 'DEBUG';
})();

type OJP_VERSION_Type = '1.0' | '2.0';
export const OJP_VERSION: OJP_VERSION_Type = '2.0';
export const SDK_VERSION = '0.16.1';
export const IS_NODE_CLI = typeof process !== 'undefined' && process.versions && process.versions.node;

if (DEBUG_LEVEL === 'DEBUG') {
    console.log('OJP version        : ' + OJP_VERSION);
    console.log('OJP-JS SDK version : ' + SDK_VERSION);
    console.log('OJP-SDK            : DEBUG features are enabled');
}
