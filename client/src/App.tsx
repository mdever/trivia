import { 
  BrowserRouter as Router,
  Switch,
  Route,
  useHistory
 } from 'react-router-dom';
import './App.css';
import { useSelector } from 'react-redux';
import HomePage from './pages/HomePage';
import { isAuthenticated, logoutAction } from './store/userSlice';
import Header from './components/Header';
import Footer from './components/Footer';
import UnauthenticatedHomePage from './pages/UnauthenticatedHomePage';
import { Container, Box } from '@material-ui/core';
import RegisterPage from './pages/RegisterPage';
import { useAppDispatch } from './store';
import ProfilePage from './pages/ProfilePage';
import GamePage from './pages/GamePage';

function App() {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const authenticated = useSelector(isAuthenticated);
  let homePage;
  if (authenticated) {
    homePage = <HomePage />;
  } else {
    homePage = <UnauthenticatedHomePage />
  }

  function logout() {
    dispatch(logoutAction())
      .then(() => {
        history && history.push('/');
      })
  }

  return (
    <div className="App">
      <Router>
        <Header doLogout={logout}/>
        <Box mt={8}>
          <Container>
            <Switch>
              <Route exact={true} path="/">
                { homePage }
              </Route>
              <Route path="/register">
                <RegisterPage />
              </Route>
              <Route path="/games/:id">
                <GamePage />
              </Route>
              <Route path="/profile">
                <ProfilePage />
              </Route>
            </Switch>
          </Container>
        </Box>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
