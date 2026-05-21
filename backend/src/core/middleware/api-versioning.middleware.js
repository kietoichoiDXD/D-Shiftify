/**
 * API Versioning Middleware
 * Handles API version detection and routing
 */

export const API_VERSIONS = {
    V1: 'v1',
    V2: 'v2',
};

export const DEFAULT_API_VERSION = API_VERSIONS.V1;

/**
 * Detects API version from request URL
 * Supports: /api/v1/..., /api/v2/..., or default to v1
 */
export const detectApiVersion = (req, res, next) => {
    const versionMatch = req.path.match(/^\/v(\d+)\//);
    
    if (versionMatch) {
        req.apiVersion = `v${versionMatch[1]}`;
    } else {
        req.apiVersion = DEFAULT_API_VERSION;
    }
    
    next();
};

/**
 * Version compatibility middleware
 * Prevents older API versions from accessing newer features
 */
export const versionCompatibility = (minVersion) => {
    return (req, res, next) => {
        const versions = Object.values(API_VERSIONS);
        const minIndex = versions.indexOf(minVersion);
        const currentIndex = versions.indexOf(req.apiVersion);
        
        if (currentIndex < minIndex) {
            return res.status(410).json({
                code: 'API_VERSION_DEPRECATED',
                message: `API version ${req.apiVersion} is no longer supported. Please use ${minVersion} or later.`,
                minimumVersion: minVersion,
            });
        }
        
        next();
    };
};

/**
 * Deprecation warning header
 * Warns clients about upcoming API deprecation
 */
export const deprecationHeader = (deprecatedIn, sunsetDate) => {
    return (req, res, next) => {
        if (req.apiVersion === deprecatedIn) {
            res.set('Deprecation', 'true');
            res.set('Sunset', new Date(sunsetDate).toUTCString());
            res.set('Warning', `299 - "API version ${deprecatedIn} is deprecated. Sunset date: ${sunsetDate}"`);
        }
        next();
    };
};
