import logo from './logo.svg';
import './App.css';
import Main from './Main.js';
import HomePage from './components/HomePage';
import Header from './components/Header';
import Footer from './components/Footer';
import NewPlayer from './components/NewPlayer';
import EditGame from './components/EditGame';
import Room from './components/Room';

import { useDispatch, useSelector } from 'react-redux';
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

  const setAppLoading = () => {
    dispatch({ type: 'BEGIN_APP_LOADING', payload: {} });
    return function() {
      dispatch({type: 'END_APP_LOADING', payload: {}});
    }
  }

  return (
    <div className="App">
      <Router history={history}>
        <Main setAppLoading={setAppLoading}>
          { isAppLoading &&
            <div>App is loading</div>
          }
          <Header login={login} logout={doLogout(() => history && history.push('/'))} login={doLogin}/>
          <div id="main">

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
                <Route path="/rooms/:code">
                  <Room />
                </Route>
              </Switch>

          </div>
          <Footer />
        </Main>
      </Router>
    </div>
  );
}

export default App;
