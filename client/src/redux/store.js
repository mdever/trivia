import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers';
import { composeWithDevTools } from 'redux-devtools-extension';


const composedEnhancer = composeWithDevTools(
    applyMiddleware(thunk)
);

const store = createStore(rootReducer, composedEnhancer);
export default store;