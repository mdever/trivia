import { Action, combineReducers, configureStore } from "@reduxjs/toolkit";
import usersReducer from './userSlice';
import gamesReducer from './gamesSlice';
import { useDispatch } from "react-redux";

const appReducers = combineReducers({
    user: usersReducer,
    games: gamesReducer
});

const rootReducer = (state: any, action: Action) => {
  if (action.type === 'hydrate') {
      const username = localStorage.getItem('username');
      const token = localStorage.getItem('token');
      return {
          ...state,
          user: {
            ...state.user,
            identity: {
                username
            },
            token
          }
      }
  } else {
      return appReducers(state, action);
  }
}

const store = configureStore({
    reducer: rootReducer
})

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();

store.dispatch({type: 'hydrate'});

export default store;
