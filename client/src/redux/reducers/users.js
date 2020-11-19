import { NEW_USER, NEW_USER_RESPONSE, NEW_USER_ERROR } from '../actionTypes';
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
                currentUser: action.payload
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
        default: {
            return state;
        }
    }
}

export function createNewUser(name) {
    return async function(dispatch, getState) {
        try {
            const res = await fetch('/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name })
            });

            const json = await res.json();
            dispatch(newUserResponse(json));
        } catch (error) {
            console.log('NEW_USER_ERROR:', error);
            dispatch(newUserError('500','Server Error: Could not create a user'));
        }
    }
}