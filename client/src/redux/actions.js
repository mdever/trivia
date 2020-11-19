import { CREATE_USER, CREATE_ROOM, ADD_USER_TO_ROOM, NEW_USER_RESPONSE, NEW_USER_ERROR } from './actionTypes';

export const createRoom = name => ({
    type: CREATE_ROOM,
    payload: {
        name
    }
})

export const newUserError = (code, message) => ({
    type: NEW_USER_ERROR,
    payload: {
        code,
        message
    }
});


export function newUserResponse(user) {
    console.log('Creating New User Response event');
    console.log(user);
    return {
        type: NEW_USER_RESPONSE,
        payload: {...user}
    }
}