import { CREATE_ROOM, CREATE_ROOM_RESPONSE, CREATE_ROOM_ERROR } from '../actionTypes';

const initialState = {
    currentRoom: null,
    error: null
}

export function roomsReducer(state = initialState, action) {

    switch (action.type) {
        case CREATE_ROOM_RESPONSE: {
            return {
                ...state,
                currentRoom: action.payload
            }
        }
        case CREATE_ROOM_ERROR: {
            return {
                ...state,
                error: action.payload
            }
        }
        default: {
            return state;
        }
    }
}

export function createNewRoom(name) {
    return async function(dispatch, getState) {
        try {
                let res = await fetch('/rooms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({name})
            });

            let json = await res.json();

            dispatch({ type: CREATE_ROOM_RESPONSE, payload: json });
        } catch (error) {
            dispatch({ type: CREATE_ROOM_ERROR, payload: { code: error.code, message: error.message }})
        }
    }
}