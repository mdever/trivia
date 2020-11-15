import { combineReducers } from 'redux';

import { roomsReducer } from './rooms';

const rootReducer = combineReducers({
    rooms: roomsReducer
})

export default rootReducer;