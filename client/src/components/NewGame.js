import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { createNewGame } from '../redux/actions';


export default function NewGame() {

    const [name, setName] = useState('');
    const dispatch = useDispatch();

    const complete = useSelector(state => state.games.currentGame);

    const onClick = (event) => {
        dispatch(createNewGame(name))
            .then(res => console.log(res));
    }

    return (
        <div>
            <label htmlFor="gameName">Name: </label>
            <input type="text" name="gameName" id="gameName" onChange={ (event) => setName(event.target.value) }/>
            <button onClick={onClick} className="btn btn-primary">New Game</button>
        </div>
    )
}