import { CREATE_USER, CREATE_ROOM, ADD_USER_TO_ROOM } from './actionTypes';

export const createRoom = name => ({
    type: CREATE_ROOM,
    payload: {
        name
    }
})