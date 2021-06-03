import { configureStore } from "@reduxjs/toolkit";
import usersReducer from './userSlice';
import gamesReducer from './gamesSlice';

const store = configureStore({
    reducer: {
        user: usersReducer,
        games: gamesReducer
    }
})

export type AppState = ReturnType<typeof store.getState>;

export default store;
