import { CREATE_USER, CREATE_ROOM, ADD_USER_TO_ROOM, NEW_USER_RESPONSE, NEW_USER_ERROR, NEW_GAME_SUCCESS, NEW_GAME_ERROR, FETCH_GAMES_SUCCESS, FETCH_GAMES_ERROR, FETCH_GAMES } from './actionTypes';

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

export function createNewGame(name, routeToGamesPage) {
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
                    ownerId: user.id
                })
            });

            res = await res.json();

            dispatch(newGameSuccess(res))
            
            routeToGamesPage(res.id);
        } catch (error) {
            console.log('Error at createNewGame():', error);
            dispatch({ type: NEW_GAME_ERROR, payload: error});
        }
        

    }
}
export const newGameSuccess = (game) => ({ type: NEW_GAME_SUCCESS, payload: game});

export function fetchGames(userId) {
    return async function(dispatch, getState) {

        if (!userId) {
            userId = getState().users.currentUser.id;
        }

        dispatch({type: FETCH_GAMES, payload: {}});

        try {
            let res = await fetch('/games?userId=' + encodeURIComponent(userId), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            res = await res.json();
            dispatch(fetchGamesSuccess(res));
        } catch (error) {
            console.log('Error at fetchGames():', error);
            dispatch(fetchGamesError(error));
        }
    }
}

export const fetchGamesSuccess = (games) => ({ type: FETCH_GAMES_SUCCESS, payload: games });
export const fetchGamesError = (error) => ({ type: FETCH_GAMES_ERROR, payload: error });