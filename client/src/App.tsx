import { 
  BrowserRouter as Router,
  Switch,
  Route,
  Link
 } from 'react-router-dom';
import React from 'react';
import logo from './logo.svg';
import './App.css';
import { useSelector } from 'react-redux';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import { isAuthenticated } from './store/userSlice';
import Header from './components/Header';

function App() {
  const authenticated = useSelector(isAuthenticated);
  let homePage;
  if (authenticated) {
    homePage = <HomePage />;
  } else {
    homePage = <LoginPage />
  }

  return (
    <div className="App">
      <Router>
        <Header />
        <Switch>
          <Route path="/">
            { homePage }
          </Route>
          <Route path="/games">

          </Route>
          <Route path="">

          </Route>
        </Switch>
      </Router>
      <footer>
        Space for footer
      </footer>
    </div>
  );
}

export default App;
