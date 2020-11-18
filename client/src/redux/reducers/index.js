import { combineReducers } from 'redux';

import { roomsReducer } from './rooms';
import { userReducer } from './users';

const rootReducer = combineReducers({
    rooms: roomsReducer,
    users: userReducer
})

export default rootReducer;