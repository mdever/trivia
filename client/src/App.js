import logo from './logo.svg';
import './App.css';
import { useDispatch, useSelector } from 'react-redux';
import { createNewRoom } from './redux/reducers/rooms';

const chooseRoom = (state) => {
  return state.rooms.currentRoom;
}
function App() {
  const dispatch = useDispatch();
  const room = useSelector(chooseRoom);

  function createRoom() {
    dispatch(createNewRoom('test'));
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      <button onClick={(event) => createRoom()}>Create Room</button>
      <div>{room ? room.id : 'No Room Joined'}</div>
    </div>
  );
}

export default App;
