import { combineReducers } from 'redux';

import { roomsReducer } from './rooms';
import { userReducer } from './users';
import { gamesReducer } from './games';

const rootReducer = combineReducers({
    rooms: roomsReducer,
    users: userReducer,
    games: gamesReducer
})

export default rootReducer;