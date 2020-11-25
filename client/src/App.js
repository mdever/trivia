import logo from './logo.svg';
import './App.css';
import Main from './Main.js';
import HomePage from './components/HomePage';
import Header from './components/Header';
import Footer from './components/Footer';
import NewPlayer from './components/NewPlayer';
import EditGame from './components/EditGame';

import { useDispatch, useSelector } from 'react-redux';
import { createNewRoom } from './redux/reducers/rooms';
import { BrowserRouter as Router, Switch, Route, useHistory } from 'react-router-dom';
import { useState } from 'react';
import { createNewUser } from './redux/reducers/users';
import { currentRoomSelector, currentUserSelector, isLoadingSelector } from './redux/selectors';

function App() {
  const dispatch = useDispatch();
  const history = useHistory();
  const room = useSelector(currentRoomSelector);
  const user = useSelector(currentUserSelector);
  const isAppLoading = useSelector(isLoadingSelector);

  function submitPlayer(player) {
    dispatch(createNewUser(player));
  }

  function createRoom() {
    dispatch(createNewRoom('test'));
  }

  const setAppLoading = () => {
    dispatch({ type: 'BEGIN_APP_LOADING', payload: {} });
    return function() {
      dispatch({type: 'END_APP_LOADING', payload: {}});
    }
  }

  return (
    <div className="App">
      <Main setAppLoading={setAppLoading}>
        { isAppLoading &&
          <div>App is loading</div>
        }
        <Header />
        <div id="main">
          <Router history={history}>
            <Switch>
              <Route exact path="/">
                {!user   
                ?  <NewPlayer onSubmit={ player => submitPlayer(player) }/>
                :  <HomePage user={user} />
                }
              </Route>
              <Route path="/rooms/:id">
                
              </Route>
              <Route path="/games/:id">
                <EditGame />
              </Route>
            </Switch>
          </Router>
        </div>
        <Footer />
      </Main>

    </div>
  );
}

export default App;
