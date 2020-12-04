const {User, Room, UserSessions, Question, Answer, Game, AuthToken} = require('./models')();
const { APIError, ErrorSubTypes } = require('./api-errors');

let checkUser;
let validatesPresence;
let loaded = false;

module.exports = function(app) {

    if (!loaded) {

        checkUser = async (req, res, next) => {
            const errorResponse = new APIError();

            let authToken = req.headers.authorization;
            if (!authToken) {
                errorResponse.addAuthenticationError(ErrorSubTypes.AUTHENTICATION_ERROR.AUTHORIZATION_MISSING, 'Authorization header not present');
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.write(errorResponse.getErrorResponse());
                res.end();
            
                return;
            }
            authToken = authToken.slice(7);
            authToken = await AuthToken.findOne({where: { value: authToken }});
            
            if (!authToken) {
                errorResponse.addAuthenticationError(ErrorSubTypes.AUTHENTICATION_ERROR.SESSION_NOT_FOUND, "No session found for Bearer token")
            }
            
            if (errorResponse.hasErrors()) {
                res.writeHead(401, {'Content-Type': 'application/json'})
                res.write(JSON.stringify(errorResponse));
                res.end();
                return;
            }
            
            
            const user = await User.findOne({ where: { id: authToken.userId } })
            
            if (!user) {
                errorResponse.addAuthenticationError(ErrorSubTypes.AUTHENTICATION_ERROR.USER_NOT_FOUND, "No user found for Bearer token")
            }
            
            if (errorResponse.hasErrors()) {
                res.writeHead(401, {'Content-Type': 'application/json'})
                res.write(JSON.stringify(errorResponse));
                res.end();
                return;
            }
            
            req.user = user;
            
            next();
        }
    }

    validatesPresence = specs => async (req, res, next) => {
        const errorResponse = new APIError();

        for (let {fieldName, location, type} of specs) {
            let theValue;
            if (location === 'BODY') {

            } else if (location === 'QUERY') {
                if (!req.query[fieldName]) {
                    errorResponse.addValidationError(ErrorSubTypes.VALIDATION_ERROR.PARAMETER_NOT_PRESENT, [{
                        name: fieldName,
                        reason: 'Not Present',
                        location: 'QUERY'
                    }]);
                }
                theValue = req.query[fieldName];
            } else if (location === 'PATH') {
    
            }

            if (type) {
                if (type === 'number') {
                    theValue = Number(theValue);
                    if (isNaN(theValue)) {
                        errorResponse.addValidationError(ErrorSubTypes.VALIDATION_ERROR.INVALID_TYPE, [{
                          name: fieldName,
                          reason: 'Not an integer',
                          location: location
                        }]);
                      }
                  
                      if (errorResponse.hasErrors()) {
                        res.writeHead(400, {'Content-Type': 'application/json'});
                        res.write(errorResponse.getErrorResponse());
                        res.send();
                        
                        return;
                      }
                }
            }
        }

        if (errorResponse.hasErrors()) {
            res.writeHead(400, {'Content-Type': 'application/json'});
            res.write(errorResponse.getErrorResponse());
            res.send();
            
            return;
        }

        next();
    }



    loaded = true;
 
    return {
        checkUser,
        validatesPresence
    }
}