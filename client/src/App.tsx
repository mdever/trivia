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

function App() {
  const authenticated = useSelector(isAuthenticated);
  let homePage;
  if (authenticated) {
    homePage = <HomePage />;
  } else {
    homePage = <UnauthenticatedHomePage />
  }

  return (
    <div className="App background-blue">
      <Router>
        <Header />
        <div id="page-container">
          <Switch>
            <Route path="/">
              { homePage }
            </Route>
            <Route path="/games">

            </Route>
            <Route path="">

            </Route>
          </Switch>
        </div>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
