import { useState } from 'react';
import { useSelector } from 'react-redux';
import { newUserErrorSelector } from '../redux/selectors';

function BannerImage() {
    return (
      <img src="../banner.png"></img>
    )
}

export default function NewPlayer(props) {
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