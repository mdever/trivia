import { configureStore } from "@reduxjs/toolkit";
import usersReducer from './userSlice';
import gamesReducer from './gamesSlice';
import { useDispatch } from "react-redux";

const store = configureStore({
    reducer: {
        user: usersReducer,
        games: gamesReducer
    }
})

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();

export default store;
