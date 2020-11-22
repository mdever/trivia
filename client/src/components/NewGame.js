import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { createNewGame } from '../redux/actions';


export default function NewGame() {

    const [name, setName] = useState('');
    const dispatch = useDispatch();
    const history = useHistory();

    const complete = useSelector(state => state.games.currentGame);

    const thenRouteToGamesPage = (id) => {
        history.push(`/games/${id}`);
    }

    const onClick = (event) => {
        dispatch(createNewGame(name, thenRouteToGamesPage));
    }

    return (
        <div>
            <label htmlFor="gameName">Name: </label>
            <input type="text" name="gameName" id="gameName" onChange={ event => setName(event.target.value) }/>
            <button onClick={onClick} className="btn btn-primary">New Game</button>
        </div>
    )
}