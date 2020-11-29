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
import { createNewUser } from './redux/reducers/users';
import { login, logout } from './redux/actions';
import { currentRoomSelector, currentUserSelector, isLoadingSelector, loggedInSelector } from './redux/selectors';

function App() {
  const dispatch = useDispatch();
  const history = useHistory();
  const room = useSelector(currentRoomSelector);
  const isLoggedIn = useSelector(loggedInSelector);
  const isAppLoading = useSelector(isLoadingSelector);

  function submitPlayer(player) {
    dispatch(createNewUser(player));
  }

  function doLogin({username, password}) {
    dispatch(login(username, password));
  }

  function doLogout(then) {
    return function() {
      dispatch(logout());
      then();
    }

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
        <Header login={login} logout={doLogout(() => history && history.push('/'))} login={doLogin}/>
        <div id="main">
          <Router history={history}>
            <Switch>
              <Route exact path="/">
                {!isLoggedIn   
                ?  <NewPlayer onCreateUser={ player => submitPlayer(player) }/>
                :  <HomePage />
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
