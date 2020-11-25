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
        <div>
          <h3>Player Name</h3>
          <input type="text" name="username" onChange={event => setUsername(event.target.value) }/>
          <input type="text" name="password" onChange={event => setPassword(event.target.value)} />
          <input type="submit" onClick={() => props.onSubmit({username, password})} />
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