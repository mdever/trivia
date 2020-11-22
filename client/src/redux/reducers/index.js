import { combineReducers } from 'redux';

import { roomsReducer } from './rooms';
import { userReducer } from './users';
import { gamesReducer } from './games';
import { apiReducer } from './api';

const rootReducer = combineReducers({
    rooms: roomsReducer,
    users: userReducer,
    games: gamesReducer,
    api: apiReducer
})

export default rootReducer;