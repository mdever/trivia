import { combineReducers } from 'redux';

import { roomsReducer } from './rooms';
import { userReducer } from './users';
import { gamesReducer } from './games';
import { questionsReducer } from './questions';
import { answersReducer } from './answers';
import { apiReducer } from './api';
import { BEGIN_APP_LOADING, END_APP_LOADING } from '../actionTypes';

const isLoadingReducer = (state = { isLoading: false, loadingCount: 0 }, action) => {
    switch (action.type) {
        case BEGIN_APP_LOADING: {
            const newLoadingCount = state.loadingCount + 1;
            return {
                ...state,
                loadingCount: newLoadingCount,
                isLoading: newLoadingCount > 0 ? true : false
            }
        }
        case END_APP_LOADING: {
            const newLoadingCount = state.loadingCount - 1;
            return {
                ...state,
                isLoading: newLoadingCount === 0 ? false : true,
                loadingCount: newLoadingCount,
            }
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
    questions: questionsReducer,
    answers: answersReducer,
    api: apiReducer,
    loading: isLoadingReducer
})

export default rootReducer;