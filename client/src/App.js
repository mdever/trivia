import logo from './logo.svg';
import './App.css';
import Main from './Main.js';

import { useDispatch, useSelector } from 'react-redux';
import { createNewRoom } from './redux/reducers/rooms';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { useState } from 'react';
import { createNewUser } from './redux/reducers/users';



const currentRoom = (state) => {
  return state.rooms.currentRoom;
}

const currentUser = (state) => state.users.currentUser;

function NewPlayer(props) {
  const [player, setPlayer] = useState({name: ''});

  return (
    <div>
      <h3>Player Name</h3>
      <input type="text" name="name" onChange={(ev) => setPlayer({name: ev.target.value}) }/>
      <input type="submit" onClick={() => props.onSubmit(player)} />
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
  const room = useSelector(currentRoom);
  const user = useSelector(currentUser);

  function submitPlayer(player) {
    dispatch(createNewUser(player.name));
  }

  function createRoom() {
    dispatch(createNewRoom('test'));
  }

  return (
    <div className="App">
      <Main>
        { !user &&
          <BannerImage />
        }
        <Router>
          <Switch>
            <Route path="/">
              {!user   
              ?  <NewPlayer onSubmit={(player) => submitPlayer(player) }/>
              :  <PlayerCard player={user} />
              }
            </Route>
            <Route path="/rooms/:id">

            </Route>
          </Switch>
        </Router>
      </Main>
    </div>
  );
}

export default App;
