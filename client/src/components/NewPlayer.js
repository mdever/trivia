import { useState } from 'react';
import { useSelector } from 'react-redux';
import { newUserErrorSelector } from '../redux/selectors';

function BannerImage() {
    return (
      <img src="../banner.png"></img>
    )
}

export default function NewPlayer(props) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const error = useSelector(newUserErrorSelector);
  
    return (
      <div>
        <BannerImage />
        <div style={{marginTop: '1rem'}}>
          <h3>New Player</h3>
          <label htmlFor="username">Username</label>
          <input type="text" id="username" name="username" onChange={event => setUsername(event.target.value) }/>
          <label htmlFor="password">Password</label>
          <input type="text" id="password" name="password" onChange={event => setPassword(event.target.value)} />
          <input className="btn btn-primary" type="submit" onClick={() => props.onCreateUser({username, password})} value="Create" />
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