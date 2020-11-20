import { NEW_GAME_SUCCESS, NEW_GAME_ERROR } from "../actionTypes"

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
        default: {
            return state;
        }
    }
}