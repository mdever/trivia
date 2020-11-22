import { useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { createNewGame } from '../redux/actions';
import  AppLoadingContext  from '../context/AppLoadingContext';


export default function NewGame() {

    const [name, setName] = useState('');
    const dispatch = useDispatch();
    const history = useHistory();
    const setAppLoading = useContext(AppLoadingContext);

    const thenRouteToGamesPage = (endAppLoading) => {
        return function (id) {
            endAppLoading();
            history.push(`/games/${id}`);
        }
    }

    const onClick = (event) => {
        const endAppLoading = setAppLoading();
        dispatch(createNewGame(name, thenRouteToGamesPage(endAppLoading)));
    }

    return (
        <div>
            <label htmlFor="gameName">Name: </label>
            <input type="text" name="gameName" id="gameName" onChange={ event => setName(event.target.value) }/>
            <button onClick={onClick} className="btn btn-primary">New Game</button>
        </div>
    )
}