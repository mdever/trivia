import { CREATE_USER, CREATE_ROOM, ADD_USER_TO_ROOM, NEW_USER_RESPONSE, NEW_USER_ERROR, NEW_GAME_SUCCESS, NEW_GAME_ERROR } from './actionTypes';

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

export function createNewGame(name) {
    return async function(dispatch, getState) {
        const state = getState();
        const user = state.users.currentUser;
        console.log('Submitting request for ', user.name, user.id, name);

        try {
            let res = await fetch('/games', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    user_id: user.id
                })
            });

            res = await res.json();

            dispatch(newGameSuccess(res)); 
        } catch (error) {
            console.log('Error at createNewGame():', error);
            dispatch({ type: NEW_GAME_ERROR, payload: error});
        }
        

    }
}
export const newGameSuccess = (game) => ({ type: NEW_GAME_SUCCESS, payload: game});