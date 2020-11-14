import logo from './logo.svg';
import './App.css';

function App() {
  function createRoom() {
    fetch('/rooms', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: 'Tester Room' })
    })
    .then(res => res.json())
    .then(json => console.log(json));
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
