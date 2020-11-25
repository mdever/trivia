
const ErrorTypes = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INVALID_REFERENCE_ERROR: 'INVALID_REFERENCE_ERROR',
    SERVER_ERROR: 'SERVER_ERROR',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR'
};

const ErrorSubTypes = {
    VALIDATION_ERROR: {
        PARAMETER_NOT_PRESENT: 'PARAMETER_NOT_PRESENT',
        INVALID_TYPE: 'INVALID_TYPE'  
    },
    INVALID_REFERENCE_ERROR: {
        ENTITY_NOT_FOUND: 'ENTITY_NOT_FOUND'
    },
    SERVER_ERROR: {
        
    },
    AUTHENTICATION_ERROR: {
        AUTHORIZATION_MISSING: 'AUTHORIZATION_HEADER_MISSING',
        SESSION_NOT_FOUND: 'NO_SESSION_FOUND',
        USER_NOT_FOUND: 'NO_USER_FOUND'
    },
    AUTHORIZATION_ERROR: {
        ACCESS_TO_RESOURCE_DENIED: 'ACCESS_TO_RESOURCE_DENIED'
    }
};

module.exports = {
    ErrorTypes,
    ErrorSubTypes
}

module.exports.APIError = class APIError {
    constructor() {
        this.errors = []
    }

    hasErrors() {
        return this.errors.length > 0;
    }

    addValidationError(subType, invalidParams) {
        let validationError = this.errors.find(er => er.type === ErrorTypes.VALIDATION_ERROR && er.title === subType);
        if (validationError) {
            validationError.invalidParams = [...validationError.invalidParams, ...invalidParams];
        } else {
            this.errors.push({
                type: ErrorTypes.VALIDATION_ERROR,
                title: subType,
                invalidParams: [
                    ...invalidParams
                ]
            })
        }
    }

    addInvalidReferenceError(subType, invalidReferences) {
        let invalidReferenceError = this.errors.find(er => er.type === ErrorTypes.INVALID_REFERENCE_ERROR && er.title === subType);
        if (invalidReferenceError) {
            invalidReferenceError.invalidReferences = [...invalidReferenceError.invalidReferences, ...invalidReferences]
        } else {
            this.errors.push({
                type: ErrorTypes.INVALID_REFERENCE_ERROR,
                title: subType,
                invalidReferences: [
                    ...invalidReferences
                ]
            })
        }
    }

    addAuthenticationError(subType, reason) {
        this.errors.push({
            type: ErrorTypes.AUTHENTICATION_ERROR,
            title: subType,
            authorizationErrors: [
                {
                    reason: reason
                }
            ]

        })
    }

    addAuthorizationError(subType, reason) {
        this.errors.push({
            type: ErrorTypes.AUTHORIZATION_ERROR,
            title: subType,
            authorizationErrors: [
                {
                    reason: reason
                }
            ]

        })
    }

    getErrorResponse() {
        return JSON.stringify({errors: this.errors});
    }
}
