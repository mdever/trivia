import { NEW_USER, NEW_USER_RESPONSE } from '../actionTypes';
import { newUserResponse } from '../actions';

const initialState = {
    currentUser: null
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
        default: {
            return state;
        }
    }
}

export function createNewUser(name) {
    return async function(dispatch, getState) {
        const res = await fetch('/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name })
        });

        const json = await res.json();

        dispatch(newUserResponse(json));
    }
}