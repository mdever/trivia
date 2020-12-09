import { CREATE_ROOM_SUCCESS, CREATE_ROOM_ERROR } from '../actionTypes';

const initialState = {
    currentRoom: null,
    error: null
}

export function roomsReducer(state = initialState, action) {

    switch (action.type) {
        case CREATE_ROOM_SUCCESS: {
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
