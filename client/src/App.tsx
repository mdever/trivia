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
import React from 'react';
import { WebSocketContext } from './context/WebSocketContext';
import GameRoom from './pages/GameRoom';

function App() {
  const dispatch = useAppDispatch();
  const authenticated = useSelector(isAuthenticated);
  let homePage;
  if (authenticated) {
    homePage = <HomePage />;
  } else {
    homePage = <UnauthenticatedHomePage />
  }

  return (
    <div className="App">
      <Router>
        <Header/>
        <Box style={{minHeight: '600px'}} mt={8}>
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
              <Route path="/rooms/:roomCode">
                <GameRoom />
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
