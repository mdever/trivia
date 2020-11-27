import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers';
import { composeWithDevTools } from 'redux-devtools-extension';

let username = localStorage.getItem('username');
let token    = localStorage.getItem('token');
let id       = localStorage.getItem('id');


const composedEnhancer = composeWithDevTools(
    applyMiddleware(thunk)
);

let store = null;

if (username) {
    let initialState = {
        rooms: {
            currentRoom: null
        },
        users: {
            currentUser: {
                username,
                token,
                id
            },
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