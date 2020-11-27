import { NEW_USER, NEW_USER_RESPONSE, NEW_USER_ERROR, LOGIN_USER_SUCCESS, LOGIN_USER_ERROR, LOGOUT_SUCCESS } from '../actionTypes';
import { newUserResponse, newUserError } from '../actions';

const initialState = {
    currentUser: null,
    error: null
};

export function userReducer(state = initialState, action) {
    switch (action.type) {
        case NEW_USER: {

        }
        case NEW_USER_RESPONSE: {
            return {
                ...state,
                currentUser: {
                    username: action.payload.username,
                    id: action.payload.id,
                    token: action.payload.token
                }
            }
        }
        case NEW_USER_ERROR: {
            return {
                ...state,
                error: {
                    code: action.payload.code,
                    message: action.payload.message
                }
            }
        }
        case LOGIN_USER_SUCCESS: {
            return {
                ...state,
                currentUser: {
                    username: action.payload.username,
                    id: action.payload.id,
                    token: action.payload.token
                }
            }
        }
        case LOGIN_USER_ERROR: {
            return {
                ...state,
                error: action.error
            };
        }
        case LOGOUT_SUCCESS: {
            return {
                ...state,
                currentUser: {
                    username: null,
                    token: null
                }
            }
        }
        default: {
            return state;
        }
    }
}

export function createNewUser({username, password}) {
    return async function(dispatch, getState) {
        try {
            let res = await fetch('/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            let body = await res.json();
            localStorage.setItem('token', body.token);
            localStorage.setItem('username', body.username);
            localStorage.setItem('id', body.id);
            dispatch(newUserResponse(body));
        } catch (error) {
            console.log('NEW_USER_ERROR:', error);
            dispatch(newUserError('500','Server Error: Could not create a user'));
        }
    }
}