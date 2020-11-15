import logo from './logo.svg';
import './App.css';
import { useDispatch } from 'react-redux';
import { createNewRoom } from './redux/reducers/rooms';

function App() {
  const dispatch = useDispatch();
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
    </div>
  );
}

export default App;
