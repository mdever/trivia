import logo from './logo.svg';
import './App.css';
import Main from './Main.js';
import HomePage from './components/HomePage/HomePage';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';

import { useDispatch, useSelector } from 'react-redux';
import { createNewRoom } from './redux/reducers/rooms';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { useState } from 'react';
import { createNewUser } from './redux/reducers/users';
import { newUserErrorSelector, currentRoomSelector, currentUserSelector } from './redux/selectors';


function NewPlayer(props) {
  const [player, setPlayer] = useState({name: ''});


  const error = useSelector(newUserErrorSelector);

  return (
    <div>
      <BannerImage />
      <div>
        <h3>Player Name</h3>
        <input type="text" name="name" onChange={event => setPlayer({name: event.target.value}) }/>
        <input type="submit" onClick={() => props.onSubmit(player)} />
      </div>
      {error && 
        <div>
          <p>Sorry, something went wrong creating a user</p>
          <p>{error.message}</p>
        </div>
      }
    </div>
  )
}

function PlayerCard(props) {
  return (
    <div>
      {props.player.name}
    </div>
  )
}

function BannerImage() {
  return (
    <img src="/banner.png"></img>
  )
}

function App() {
  const dispatch = useDispatch();
  const room = useSelector(currentRoomSelector);
  const user = useSelector(currentUserSelector);

  function submitPlayer(player) {
    dispatch(createNewUser(player.name));
  }

  function createRoom() {
    dispatch(createNewRoom('test'));
  }

  return (
    <div className="App">
      <Main>
        <Header />
        <Router>
          <Switch>
            <Route path="/">
              {!user   
              ?  <NewPlayer onSubmit={(player) => submitPlayer(player) }/>
              :  <HomePage user={user} />
              }
            </Route>
            <Route path="/rooms/:id">
              
            </Route>
          </Switch>
        </Router>
        <Footer />
      </Main>

    </div>
  );
}

export default App;
