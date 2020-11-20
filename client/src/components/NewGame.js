import { useState } from 'react';
import { useDispatch } from 'react-redux';

import { createNewGame } from '../redux/actions';


export default function NewGame() {

    const [name, setName] = useState('');
    const dispatch = useDispatch();

    const onClick = (event) => {
        dispatch(createNewGame(name));
    }

    return (
        <div>
            <label htmlFor="gameName">Name: </label>
            <input type="text" name="gameName" id="gameName" onChange={ (event) => setName(event.target.value) }/>
            <button onClick={onClick} className="btn btn-primary">New Game</button>
        </div>
    )
}