import { FETCH_GAMES, FETCH_GAMES_SUCCESS, FETCH_GAMES_ERROR } from '../actionTypes';

function createLoadable() {
    return {
        loading: false,
        loaded: true,
        error: null
    }
}

const initialState = {
    games: {
        fetch: createLoadable(),
        create: createLoadable()
    },
    user: {
        fetch: createLoadable(),
        create: createLoadable()
    }
};

export function apiReducer(state = initialState, action) {
    switch (action.type) {
        case FETCH_GAMES: {
            return {
                ...state,
                games: {
                    ...state.games,
                    fetch: {
                        ...state.games.fetch,
                        loading: true
                    },
                }
            }
        }
        case FETCH_GAMES_SUCCESS: {
            return {
                ...state,
                games: {
                    ...state.games,
                    fetch: {
                        ...state.games.fetch,
                        loading: false,
                        loaded: true,
                        error: null
                    }

                }

            }
        }
        case FETCH_GAMES_ERROR: {
            return {
                ...state,
                games: {
                    ...state.games,
                    fetch: {
                        ...state.games.fetch,
                        loading: false,
                        loaded: false,
                        error: action.payload
                    }
                }
            }
        }
        default: {
            return state;
        }
    }
}

export const fetchGamesLoading = state => state.api.games.fetch.loading;