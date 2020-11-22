import { combineReducers } from 'redux';

import { roomsReducer } from './rooms';
import { userReducer } from './users';
import { gamesReducer } from './games';
import { apiReducer } from './api';
import { BEGIN_APP_LOADING, END_APP_LOADING } from '../actionTypes';

const isLoadingReducer = (state = false, action) => {
    switch (action.type) {
        case BEGIN_APP_LOADING: {
            return true
        }
        case END_APP_LOADING: {
            return false;
        }
        default: {
            return state
        }
    }
}

const rootReducer = combineReducers({
    rooms: roomsReducer,
    users: userReducer,
    games: gamesReducer,
    api: apiReducer,
    loading: isLoadingReducer
})

export default rootReducer;