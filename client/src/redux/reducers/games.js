import { NEW_GAME_SUCCESS, NEW_GAME_ERROR, FETCH_GAMES_SUCCESS, FETCH_GAMES_ERROR, CREATE_ROOM_SUCCESS } from "../actionTypes"

const initialState = {
    games: [],
    currentGame: null,
    error: null
}

export function gamesReducer(state = initialState, action) {
    switch (action.type) {
        case NEW_GAME_SUCCESS: {
            return {
                ...state,
                games: [
                    ...state.games,
                    action.payload
                ]
            }
        }
        case NEW_GAME_ERROR: {
            return {
                ...state,
                error: action.payload
            }
        }
        case FETCH_GAMES_SUCCESS: {
            return {
                ...state,
                games: [ ...action.payload ]
            }
        }
        case FETCH_GAMES_ERROR: {
            return {
                ...state,
                error: action.payload
            }
        }
        case CREATE_ROOM_SUCCESS:
            return {
                ...state,
                currentGame: {
                    name: action.state
                }
            }
        default: {
            return state;
        }
    }
}