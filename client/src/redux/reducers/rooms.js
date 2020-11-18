import { CREATE_ROOM, CREATE_ROOM_RESPONSE } from '../actionTypes';

const initialState = {
    currentRoom: null
}

export function roomsReducer(state = initialState, action) {

    switch (action.type) {
        case CREATE_ROOM_RESPONSE: {
            return {
                ...state,
                currentRoom: action.payload
            }
        }
        default: {
            return state;
        }
    }
}

export function createNewRoom(name) {
    return async function(dispatch, getState) {
        let res = await fetch('/rooms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name})
        });

        let json = await res.json();
        dispatch({type: CREATE_ROOM_RESPONSE, payload: json});
    }
}