import { createStore, applyMiddleware } from 'redux';
import { thunkMiddleware } from 'redux-thunk';
import rootReducer from './reducers';
import { composeWithDevtools } from 'redux-devtools-extension';


const composedEnhancer = composeWithDevtools(
    applyMiddleware(thunkMiddleware)
);

export const store = createStore(rootReducer, composedEnhancer);