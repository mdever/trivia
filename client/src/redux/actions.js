import { CREATE_USER, CREATE_ROOM, ADD_USER_TO_ROOM, NEW_USER_RESPONSE } from './actionTypes';

export const createRoom = name => ({
    type: CREATE_ROOM,
    payload: {
        name
    }
})

export function newUserResponse(user) {
    console.log('Creating New User Response event');
    console.log(user);
    return {
        type: NEW_USER_RESPONSE,
        payload: {...user}
    }
}