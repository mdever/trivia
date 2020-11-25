
const ErrorTypes = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INVALID_REFERENCE_ERROR: 'INVALID_REFERENCE_ERROR',
    SERVER_ERROR: 'SERVER_ERROR'
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

    getErrorResponse() {
        return JSON.stringify({errors: this.errors});
    }
}
