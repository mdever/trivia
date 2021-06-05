import { 
  BrowserRouter as Router,
  Switch,
  Route,
  Link
 } from 'react-router-dom';
import './App.css';
import { useSelector } from 'react-redux';
import HomePage from './pages/HomePage';
import { isAuthenticated } from './store/userSlice';
import Header from './components/Header';
import Footer from './components/Footer';
import UnauthenticatedHomePage from './pages/UnauthenticatedHomePage';
import { Container } from '@material-ui/core';
import RegisterPage from './pages/RegisterPage';

function App() {
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
        <Header />
        <Container>
          <Switch>
            <Route exact={true} path="/">
              { homePage }
            </Route>
            <Route path="/register">
              <RegisterPage />
            </Route>
            <Route path="/games">

            </Route>
          </Switch>
        </Container>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
