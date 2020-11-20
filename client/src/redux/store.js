import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers';
import { composeWithDevTools } from 'redux-devtools-extension';

let user = localStorage.getItem('user');

const composedEnhancer = composeWithDevTools(
    applyMiddleware(thunk)
);

let store = null;

if (user) {
    user = JSON.parse(user);
    let initialState = {
        rooms: {
            currentRoom: null
        },
        users: {
            currentUser: user,
            error: null
        },
        games: {
            games: [],
            currentGame: null,
            error: null
        }
    }
    store = createStore(rootReducer, initialState, composedEnhancer)
} else {
    store = createStore(rootReducer, composedEnhancer);
}

export default store;