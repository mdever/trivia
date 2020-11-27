import { CREATE_USER, CREATE_ROOM, ADD_USER_TO_ROOM, NEW_USER_RESPONSE,
         NEW_USER_ERROR, NEW_GAME_SUCCESS, NEW_GAME_ERROR, FETCH_GAMES_SUCCESS,
         FETCH_GAMES_ERROR, FETCH_GAMES, FETCH_QUESTIONS_SUCCESS, LOGIN_USER_SUCCESS, LOGIN_USER_ERROR } from './actionTypes';

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
        const token = getState().users.currentUser.token;

        try {
            let res = await fetch('/games', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    name
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

export function fetchGames(options = {}) {
    return async function(dispatch, getState) {

        const token = getState().users.currentUser.token;

        dispatch({type: FETCH_GAMES, payload: {}});

        let url = '/games';
        if (options.includeQuestions) {
            url += '?includeQuestions';
        }

        try {
            let res = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
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

export function fetchQuestionsForGame(gameId) {
    return async function(dispatch, getState) {
        const userId = getState().users.currentUser.id;
        const token = getState().users.currentUser.token;

        let res = await fetch(`/questions?gameId=${gameId}`, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        res = await res.json();

        dispatch({type: FETCH_QUESTIONS_SUCCESS, questions: res});
    }
}

export function login(username, password) {
    return async function (dispatch, getState) {
        
        try {
            let res = await fetch('/tokens', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            let body = await res.json();

            if (res.status !== 200) {
                dispatch({type: LOGIN_USER_ERROR, error: body.message});
                return;
            }

            localStorage.setItem('token', body.token);
            localStorage.setItem('username', body.username);
            localStorage.setItem('id', body.id)
            dispatch({ type: LOGIN_USER_SUCCESS, payload: body});
        } catch (error) {
            dispatch({ type: LOGIN_USER_ERROR, error: error.message })
        }
    }
}

export function logout() {
    return async function (dispatch, getState) {

        let token = getState().users.currentUser.token;

        let res = await fetch('/tokens', {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        if (res.status == 200) {
            localStorage.removeItem('username');
            localStorage.removeItem('token');
            localStorage.removeItem('id');
            dispatch({ type: 'LOGOUT_SUCCESS' })
        } else {
            let body = await res.json();
            console.log('Could not logout', body);
        }

    }
}

export const fetchGamesSuccess = (games) => ({ type: FETCH_GAMES_SUCCESS, payload: games });
export const fetchGamesError = (error) => ({ type: FETCH_GAMES_ERROR, payload: error });