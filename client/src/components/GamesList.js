import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchGames } from '../redux/actions';

function GameItem(props) {
    return (
        <div>
            <p>{props.game.name}</p>
        </div>
    )
}

export default function GamesList() {
    const games = useSelector(state => state.games.games);
    const user = useSelector(state => state.users.currentUser);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchGames(user.id));
    }, []);

    return (
        <div>
            <ul>
            {   games.map(game => {
                    return <li key={game.id}>
                        <GameItem game={game} />
                    </li>
                })
            }  
            </ul>
        </div>
    );
}